/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
const Tour = require('./../model/tourModle');
const catchAsync = require('./../errFolder/catchAsyn');
const AppError = require('./../errFolder/err');
const User = require('./../model/userModle');
const Booking = require('./../model/bookingModel');

exports.getOverview = async (req, res) => {
  //1) Get tour data from collection
  const tours = await Tour.find();
  //2) Bulid Templates

  //3)render the page
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  res.status(200).render('signUp', {});
});

exports.getTour = catchAsync(async (req, res, next) => {
  //1) Get tour data from collection
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  let booking;
  if (req.user)
    booking = await Booking.findOne({ user: req.user.id, tour: tour.id });
  else booking = '';
  const { outOfStock } = req;
  if (!tour) {
    return next(new AppError('There Is no Tour with this name', 404));
  }
  //2) Bulid Templates
  //3)render the page
  res.status(200).render('tour', {
    title: tour.name,
    tour,
    outOfStock,
    booking
  });
});
exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
});
exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
});
exports.updateUserData = catchAsync(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
exports.getResetPasswordForm = catchAsync(async (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Reset Password'
  });
});
exports.forgetPasswordForm = catchAsync(async (req, res) => {
  res.status(200).render('forgetPassword', {
    title: 'forget Password'
  });
});
exports.getMyTours = catchAsync(async (req, res, next) => {
  //* 1) Find all bookings
  const bookings = await Booking.find({ user: req.user.id });
  const toursIDS = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: toursIDS });
  res.status(200).render('overview', { title: 'My Tours', tours });
});
exports.getMyFavorite = catchAsync(async (req, res, next) => {
  //* 1) Find all favorite
  const favoriteTours = await Tour.find({
    _id: { $in: req.user.liked }
  });
  res
    .status(200)
    .render('overview', { title: 'My Favorites', tours: favoriteTours });
});
