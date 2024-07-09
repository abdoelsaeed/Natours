/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
const mongoose = require('mongoose');
const Tour = require('./tourModle');

const reviewModel = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
      }
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
      }
    ]
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
//static function بتخلي this تشير ال Model بدل الDoc
reviewModel.statics.calcAverageRating = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  //عشان نفس اليوزر مايدخلش القيمه مرتين لو كنت عملت التور يونيك كان ماينفعش اعمل كذا ريفيو علي نفس التور نفس حوار الايميل كده انما دي معناها لو نفس اليوزر والتور
  reviewModel.index({ tour: 1, user: 1 }, { unique: true });
  //لو الaggregate رجع array فاضي
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].nRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 0,
      ratingsQuantity: 4.5
    });
  }
};
reviewModel.post('save', function() {
  //this.constructor = ReviewModel;
  this.constructor.calcAverageRating(this.tour);
});
// استخدمت pre عشان اخلي this.r تبقي موجوده قبل ما اي حاجه تحصل
reviewModel.pre(/^findOneAnd/, async function(next) {
  //this in 'find' reference to big this but this in 'save' reference to current document
  this.review = await this.findOne();
  next();
});
reviewModel.post(/^findOneAnd/, async function() {
  //why i don't use await this.findOne() there ? in post does't work because this actually excuted (البوست بيبقي الكويري اتعمل وخلاص)
  //this.r.constructor لان الكونسترركتور بيبقي موجود في this بتاعت ال'save'
  this.review.constructor.calcAverageRating(this.review.tour);
});
reviewModel.pre(/^find/, function(next) {
  this.populate({ path: 'user', select: 'name photo' });
  // .populate({
  //   path: 'tour',
  //   select: 'name'
  // });
  next();
});

const Review = mongoose.model('Review', reviewModel);
module.exports = Review;
