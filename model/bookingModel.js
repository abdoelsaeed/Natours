/* eslint-disable node/no-unsupported-features/es-syntax */
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Booking must belong to a Tour!']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Booking must belong to a User!']
  },
  price: {
    type: Number,
    required: [true, 'Booking must have a price.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  //&دي لو مثلا محدش معاه فيزا فبيرح الفرع يدفع فلوس ويحجز الرحله وفي الحاله دي هخليها false
  paid: {
    type: Boolean,
    default: true
  }
});

bookingSchema.pre(/^find/, function(next) {
  this.populate('user').populate({ path: 'tour', select: 'name' });
  next();
});

//&reviewModel.pre(/^findOneAnd/, async function(next) { this.review = await this.findOne();} findOneAnd تقدر تجيب الوثيقه انما لو find مش هتعرف

//todo الحل ان فيه برامتر في البوست تستخدموا هيجبلك الوثيقه
// bookingSchema.post(/^find/, function(doc, next) {
//   console.log(doc)
//   next();
// });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
