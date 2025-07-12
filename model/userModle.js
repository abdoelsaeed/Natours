/* eslint-disable prettier/prettier */
/* eslint-disable no-unreachable */
/* eslint-disable no-lone-blocks */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs'); //تشفير الباسورد مثلا
const crypto = require('crypto'); //ظائف للتشفير والفك تشفير والتجزئة وتوليد الأرقام العشوائية

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validators: [validator.isEmail, 'Please validate your email']
  },
  photo: {type:String,
  default:'default.jpg'},
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'guide', 'lead-guide', 'admin']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(value) {
        return value === this.password;
      },
      message: 'Confirm password must match the original password.'
    },
    
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  },
  liked: {
    type: [mongoose.Schema.ObjectId], // نوع العنصر داخل الأرايه هنا هو ObjectID
    default: [], // قيمة افتراضية للحقل إذا كان فارغًا
  }
}
);
// create && update only
userSchema.pre('save', async function(next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();
  //كده انا عملتها async كان قدامي اعملها sync بس مش هينفع عشان هتقفل الايفنت لوب
  this.password = await bcrypt.hash(this.password, 12);

  //الmiddleware بتحصل لما ادخل الداتا يعني معايا الداتا بس لسه مارحتش للداتا بيز فانا بتاكد انه مطابق للباسورد وبعد كده بصفره ومرضيتش امسحه لاني خليته required
  this.confirmPassword = undefined;
  next();
});
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  
  this.passwordChangedAt = Date.now() - 1000; //why -1000? passwordChangedAt فيه عيب ان التوكن هيتعمل قبل الديت دوت ناو فعشان كده قللتها ثانيه عشان يبقو حوالي نفس الوقت لان انا عامل لو هما مش نفس الوقت هيقول ان الباسورد اتغير قبل كده
  next();
});
userSchema.pre(/^find/,function(next){
  //لما بعمل delete مش بمسحوا من الداتا بيز بعمله hide بس
  
this.find({active:{$ne:false} });
next();
});
userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false; //password not changed
};
userSchema.methods.correctPassword = async function(
  candinatePassword,
  userPassword
) {
  return await bcrypt.compare(candinatePassword, userPassword);
  //bcrypt اللي مستخدمها asyncorouns
};

userSchema.methods.createPasswordRestToken = function() {
    const restToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(restToken)
      .digest('hex');
    // crypto احفظها مش فاهمها
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //مدته 10 minutes
    return restToken;
  };
const User = mongoose.model('User', userSchema);

module.exports = User;
