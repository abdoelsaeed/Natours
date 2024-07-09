/* eslint-disable no-unused-vars */
const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();
//render
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/signup', viewsController.signup);

router.get(
  '/tour/:slug',
  authController.isLoggedIn,
  bookingController.outOfStock,
  viewsController.getTour
);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
router.get(
  '/my-favorite',
  authController.protect,
  viewsController.getMyFavorite
);
router.get('/resetpassword/:token', viewsController.getResetPasswordForm);
router.get('/forgetpassword', viewsController.forgetPasswordForm);

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData
);
module.exports = router;
