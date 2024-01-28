const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/AppError');
const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');

const signinToken = (id) => {
  return jwt.sign({ id }, process.env.jwt_secret, {
    expiresIn: process.env.jwt_expire_in,
  });
};

const sentResetToken = (user, statuscode, res) => {
  // to create a token and hold it in token variable
  const token = signinToken(user._id);

  // option of cookie that i will use after
  const cookieOption = {
    // expires that when this cookie will be unvalid
    expires: new Date(
      Date.now() + process.env.jwt_cookie_expire_in * 24 * 60 * 60 * 1000
    ),
    // the client side(inspect in browser) to reach to this cookie
    httpOnly: true,
  };
  // ensure that connection be secure like (HTTPS)
  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  // res.cookie('name of cookie' , 'value of cookie' , {option to this cookie})
  res.cookie('jwt', token, cookieOption);
  // if we will send user in response we will set user.password=undefined
  // to doesn't send password back
  user.password = undefined;

  res.status(statuscode).json({
    status: 'success',
    token,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  // i will create user with this properties
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    repassword: req.body.repassword,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signinToken(newUser._id);
  res.status(201).json({
    message: 'success',
    token,
  });
});
// to login and send a secret token
exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1)check if email or password are exist
  if (!email || !password) {
    return next(new AppError(`please provide email and password`, 400));
  }

  //2)check if user is exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError(`please provide email and password correctly `, 401)
    );
  }
  sentResetToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
//to check if user is logged in
exports.protect = catchAsync(async (req, res, next) => {
  //1) Gettin token and check of it's there
  let token;

  // dont forget we sign by bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // the header like this(bearer maskacncca6ca6v486adavavanakdj)
    // like that we access to this token
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not loggen in ! please login to get access', 401)
    );
  }
  //2)verification token
  const decoded = await promisify(jwt.verify)(token, process.env.jwt_secret);
  //3) check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});
exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new AppError('you dont have permission to perform this task', 403)
      );
    }
    next();
  };
};
exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1)get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    next(new AppError('no user founded by this email', 404));
  }
  //2)generated random token
  const ResetToken = user.passwordToken();

  await user.save({ validateBeforeSave: false });
  ////////////////////////////////////////////////////////
  //3)send it to users email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${ResetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid  for only 10 min)',
      message,
    });
  } catch (err) {
    user.passwordToken = undefined;
    user.passwordResetTokenexpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'there was an error sending the email. Try again later!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'token sent to email',
  });
});
exports.resetpassword = catchAsync(async (req, res, next) => {
  //1) get user based on token in url
  // but in this step we'll hash the token in url & compare it with one in DataBase
  // we also get user by check if resettoken in url is expires or not in User.findOne
  const hashedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedtoken,
    passwordResetTokenexpires: { $gt: Date.now() },
  });

  //2)check if we have user already or not if we have "set newpassword"
  if (!user) {
    return next(
      new AppError('we dont have user or the sessio was expired', 400)
    );
  }
  user.password = req.body.password;
  user.rePassword = req.body.rePassword;
  //we want to stop this token of the work to dont allow the user to use this token again in 10 min which we provid
  user.passwordResetToken = undefined;
  user.passwordResetTokenexpires = undefined;
  await user.save();
  //4)log the user in
  sentResetToken(user, 200, res);
});
exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //1)get the user from the collection
  const user = await User.findById(req.user.id).select('+password');
  //2)check if posted cuurent password is correct

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  //3) if so, update password
  user.password = req.body.password;
  user.rePassword = req.body.rePassword;
  await user.save();
  //4)log in user
  sentResetToken(user, 200, res);
});
