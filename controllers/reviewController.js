/* eslint-disable node/no-unsupported-features/es-syntax */
const Review = require('./../model/reviewModel');
const factory = require('./handlerFactory');
const catchAsyn = require('./../errFolder/catchAsyn');
const AppError = require('./../errFolder/err');
const Booking = require('./../model/bookingModel');

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.checkIfBooking = catchAsyn(async (req, res, next) => {
  const booking = await Booking.findOne({
    tour: req.params.tourId,
    user: req.user.id
  });
  if (!booking) {
    return next(
      new AppError(
        'You have not booked this tour yet then you can not review on this tour',
        400
      )
    );
  }
  next();
});
exports.checkIfDublicateReview = catchAsyn(async (req, res, next) => {
  const review = await Review.find({
    tour: req.params.tourId,
    user: req.user.id
  });
  if (review.length > 0) {
    return next(new AppError('You have already reviewed  on this tour', 400));
  }
  next();
});
exports.getAllReviews = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
