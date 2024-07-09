/* eslint-disable no-unused-vars */
const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router.get('/checkout-session/:tourID', bookingController.getCheckoutSession);
router.use(authController.restricTo('admin', 'lead-guide'));
router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(reviewController.setTourUserId, bookingController.createBooking);
router
  .route('/:id')
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking)
  .get(bookingController.getOneBooking);
// eslint-disable-next-line prettier/prettier
module.exports = router;