/* eslint-disable node/no-missing-require */
/* eslint-disable import/no-unresolved */
const express = require('express');
const reviewController = require('./../controllers/reviewController');
// eslint-disable-next-line node/no-unpublished-require
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restricTo('user'),
    reviewController.setTourUserId,
    reviewController.checkIfBooking,
    reviewController.checkIfDublicateReview,
    reviewController.createReview
  );
router
  .route('/:id')
  .delete(authController.restricTo('admin'), reviewController.deleteReview)
  .patch(
    authController.restricTo('user', 'admin'),
    reviewController.updateReview
  )
  .get(reviewController.getReview);
module.exports = router;
