const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'a user must have username please enter your name'],
  },
  email: {
    type: String,
    unique: true,
    require: [true, 'a user must have email please enter your email'],
    validate: [validator.isEmail, 'please provid a true email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    require: [true, 'a user must have password please enter your password'],
    select: false,
  },
  rePassword: {
    type: String,
    require: [true, "the password doesn't match"],
    validate: {
      validator: function (value) {
        return value === this.password;
      },
      message: "the password doesn't match",
    },
  },
  role: {
    type: String,
    default: 'user',
    enum: ['admin', 'user', 'lead-guide', 'guide'],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenexpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  //to check if the password are modified (edited) or not
  //if is modified so is true ==> after '!' will be false
  //so doesn't call next
  if (!this.isModified('password')) return next();

  //we use await because it return promise
  this.password = await bcrypt.hash(this.password, 12);
  //to remove this field because we want it when register only
  this.rePassword = undefined;
  next();
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});
userSchema.methods.correctPassword = async function (
  passworduserinput,
  passwordindb
) {
  return await bcrypt.compare(passworduserinput, passwordindb);
};
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.methods.passwordToken = function () {
  const ResetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(ResetToken)
    .digest('hex');
  console.log({ ResetToken }, this.passwordResetToken);

  this.passwordResetTokenexpires = Date.now() + 10 * 60 * 1000;

  return ResetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
