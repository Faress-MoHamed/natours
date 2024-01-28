const User = require('./../model/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const factory = require('./handlerFactory');


exports.getAllusers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    res: users.length,
    data: {
      users,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success'
  })
});
const filterObj = (obj, ...allowdfield) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (allowdfield.includes(el)) newobj[el] = obj[el];
  });
  return newobj;
};
exports.UpdateMe = catchAsync(async(req, res, next) => {
  //1)if the user trying to update password
  if (req.body.password || req.body.rePassword) {
    return next(
      new AppError(
        'you cant update password in this route you can go to /updateMypassword',
        400
      )
    );
  }

  //2)update date
  const filtereddata = filterObj(req.body, 'name', 'email','role');
  const updateData = await User.findByIdAndUpdate(req.user.id, filtereddata, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data:{
      user:updateData
    }
  })
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}
exports.getuser = factory.getOne(User)
exports.updateuser = factory.UpdateOne(User);
exports.deleteuser = factory.deleteOne(User);