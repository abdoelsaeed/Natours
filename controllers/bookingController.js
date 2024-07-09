/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
//? in frontEnd i use public Key BUT in back end i use private Key = process.env.STRIPE_SECRET_KEY
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../model/tourModle');
const catchAsync = require('./../errFolder/catchAsyn');
const factory = require('./handlerFactory');
const Booking = require('./../model/bookingModel');
const AppError = require('../errFolder/err');

/*
&myFunction
!SomeAlert
^someStuff
?Quection
*Haghlight
~ArrowFunction
TODO
*/

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourID);
  // 2) create checkout session
  const session = await stripe.checkout.sessions.create({
    // معلومات عن السيشن
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourID
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
    mode: 'payment', // إضافة وضع الدفع
    // معلومات عن المنتج
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: ['https://ik.imagekit.io/ikmedia/backlit.jpg']
          },
          unit_amount: Math.round(tour.price * 100) // لتحويل السعر من دولار إلى سنت
        },
        quantity: 1
      }
    ]
  });
  tour.numBooking++;
  await tour.save();
  //3) create session as a response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  //todo This is only Temporary, because it is UNSECURE : everyone can make booking without paying
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  //! any one wrtie the url with req.query(tour,user,price)  that will create new booking directly we use redirect to hide the req.query even any one can't copy the url
  res.redirect(req.originalUrl.split('?')[0]);
});
exports.outOfStock = catchAsync(async (req, res, next) => {
  const tour = await Tour.find({ slug: req.params.slug });
  if (tour[0].maxGroupSize <= tour[0].numBooking) {
    req.outOfStock = true;
  }
  next();
});
exports.createBooking = factory.createOne(Booking);

exports.updateBooking = factory.updateOne(Booking);

exports.deleteBooking = factory.deleteOne(Booking);

exports.getOneBooking = factory.getOne(Booking);

exports.getAllBooking = factory.getAll(Booking);
