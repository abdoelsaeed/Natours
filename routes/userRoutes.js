/* eslint-disable no-unused-vars */
const express = require('express');
//upload photo
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.patch(
  '/loved/:tourId',
  authController.protect,
  userController.lovedTour
);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.restPassword);

//protected all routes after this middleware
router.use(authController.protect);

router.patch(
  '/updatepassword',

  authController.updatePassword
);
//upload.single('photo') ده اسم الحقل في الداتا بيز وده بيخليني ارفع الصور
router.patch(
  '/updateme',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteme', userController.deleteMe);

//protected all routes after this middleware
router.use(authController.restricTo('admin'));

router.route('/').get(userController.getAllUsers);
router.get('/me', userController.getMe, userController.getUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
