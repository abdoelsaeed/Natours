/* eslint-disable no-empty */
/* eslint-disable no-undef */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable node/no-extraneous-require */
/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-require */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const slugify = require('slugify');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHTEXCEPTION! Shutting Down ...');
  process.exit(1);
});
const validator = require('validator');
const server = require('./../server');

dotenv.config({ path: './config.env' });
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATEBASE_PASSWORD
);
mongoose
  .connect(db, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('unhandledRejection! shutting down ...');
  server.server.close(() => process.exit(1));
});
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a name '],
      unique: true,
      maxlength: [40, 'A tour name must have less than or equal 40 characters'],
      minlength: [10, 'A tour name must have more than or equal 10 characters']
      // validate: [validator.isAlpha, 'A tour name must have characters only']
    },
    slug: String,
    duration: { type: Number, required: [true, 'A tour must have a duration'] },
    maxGroupSize: { type: Number, required: [true, 'A tour must have number'] },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
      min: 15
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
      //set عشان الارقام العشريه
      set: val => Math.round(val * 10) / 10 //4.666667 = 4.7
    },
    ratingsQuantity: { type: Number, default: 0 },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          //هذه الحاله تنفع علي كريت فقط وليست علي باتش يعني بتعدل علي الدوكيمينت الجديد بس
          return value < this.price;
        },
        message: 'Price ({VALUE}) discount must be less than regular price'
      }
    },
    summary: {
      type: String,
      trim: true
    },
    description: { type: String, trim: true },
    imageCover: {
      type: String,
      required: [true, 'A tour must have Cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },

    startDates: [Date], //دي زي فيه رحله دهب هتطلع مره في الصيف ومره في الشتا وهكذا
    secretTour: { type: Boolean, default: false },
    startLocation: {
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // guides: Array   embeded
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],
    numBooking: { type: Number, default: 0 }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });
tourSchema.index({ price: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('duration Weeks').get(function() {
  return this.duration / 7;
});

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

//Document MIDDLEWARE: runs before .save() and .create() only
// tourSchema.pre('save', function(next) {
//   this.slug = slugify(this.name, { lower: true });
//   console.log(this);
//   next();
// });
// tourSchema.pre('save', async function(next) { embeded
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });
// this بتدل علي الدوكيمينت الجديد عشان كده بنقول بتنفع مع كريت مش باتش
//QUERY MIDDKEWARE FIND بمشتقاتها

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = new Date();
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.populate({ path: 'guides', select: '-__v ' });
  next();
});

tourSchema.post(/^find/, function(next) {
  console.log(`Query took ${new Date() - this.start} Milliseconds`);
});

tourSchema.pre('aggregate', function(next) {
  //$geoNear لازم تبقي اول حاجه بقوله لو مش اول حاجه اعمل اللي هو بتخفي الرحلات المخفيه
  //[ { '$geoNear': { near: [Object], distanceField: 'distance' } } ] if جابت $geoNear
  if (Object.keys(this.pipeline()[0])[0] === '$geoNear') {
  } else {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
  }
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
