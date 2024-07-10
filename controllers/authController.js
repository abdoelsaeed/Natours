/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-const */
/* eslint-disable no-empty */
/* eslint-disable import/order */
/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-require */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require('jsonwebtoken');
const User = require('./../model/userModle');
const crypto = require('crypto'); //ظائف للتشفير والفك تشفير والتجزئة وتوليد الأرقام العشوائية
const catchAsync = require('./../errFolder/catchAsyn');
const AppError = require('./../errFolder/err');
const { promisify } = require('util');
const Email = require('./../errFolder/email');
// رموز الc comment
//!
//todo
//?
const signToken = (id, ip) => {
  return jwt.sign({ id, ip }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id, req.connection.remoteAddress);
  const cookieOption = {
    expiresIn: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    secure: true, //يعني هيشتغل علي الhttps بس
    httpOnly: true //ان مينفعش اي حد يعدل عليه هو بييجي مع الريكوست
  };
  // if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

//req.connection.remoteAddress =ip adress
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role
  });
  const url = '/me';
  console.log(process.env.GMAIL_USERNAME);

  await new Email(newUser, url).sendWelcome();
  console.log(newUser, url);
  createSendToken(newUser, 201, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1)getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! please log in to get access', 401)
    );
  }
  //2)Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3)check if user still exists يعني مامسحش الاكونت مثلا
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belonging to this token does not exist', 401)
    );
  }
  //4)check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new AppError('Your password has changed! please login again', 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;

  next();
});

// Only for rendered page اللي بتشيل زرار تسجيل الدخول وتحط الصوره بتاعتك لو عامل log in
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1)getting token and check of it's there
      //1)Verification token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      //2)check if user still exists يعني مامسحش الاكونت مثلا
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      //3)check if user changed password after the token was issued
      if (currentUser.changePasswordAfter(decoded.iat)) {
        return next();
      }
      //the is already logged in/
      //locals دي كاني بباصي اليوزر ده للتيمبلت بتاع البيج زي مابعملها في res.render
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.logout = (req, res, next) => {
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000),
  //   httpOnly: true
  // });
  res.clearCookie('jwt');
  res.status(200).json({ status: 'success' });
};

exports.restricTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) check if email password is exist
  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400));
  }
  //2) check if password and email is correct
  const user = await User.findOne({ email }).select('+password');
  //جوه الif عملتها user مش User لانه الuser واخد كل الصفات منه وفنفس الوقت هو اللي عنده المعلومات
  if (!user || !(await user.correctPassword(password, user.password))) {
    //لي  ماحطيتش متغير زي الuser لانه معتمد علي اليوزر يعني لو فيه مشكله البرنامج هيقف انما في if اول ما يلاقي الشرط الاول متحققش بيروح داخل if علي طول
    return next(new AppError('Incorrect email or password', 401));
  }
  //3) If everything is ok ,send token to client
  createSendToken(user, 201, req, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get User Based on Post Email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(`There is no user with email ${req.body.email}`, 404)
    );
  //2) Generate Random rest token
  const resetToken = user.createPasswordRestToken();
  //لازم يتعمل save
  await user.save({ validateBeforeSave: false });
  //3) Send it to user's email
  try {
    const restURL = `${req.protocol}://${req.get(
      'host'
    )}/resetpassword/${resetToken}`;
    await new Email(user, restURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token send to email !'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    console.log(err.message);
    return next(
      new AppError(
        'There was an error sending this email. Try again later!',
        500
      )
    );
  }
});

exports.restPassword = catchAsync(async (req, res, next) => {
  //1)get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }
  //2)if user is not expired,and there is a user , set the new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3)update the change password
  //4)log the user in , send JWT token to client
  createSendToken(user, 201, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1 get the user
  const user = await User.findById(req.user.id).select('+password');
  //2 check if Posted password  is correct
  if (!(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError('no user have this id', 400));
  //3 if so , update the password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmNewPassword;
  await user.save();
  //4 log the user in , send JWT token to client
  createSendToken(user, 201, req, res);
});
