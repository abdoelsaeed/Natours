/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable import/no-unresolved */
/* eslint-disable node/no-missing-require */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
/* eslint-disable no-return-assign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint-disable no-const-assign */
/* eslint-disable no-console */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
const Tour = require('./../model/tourModle');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../errFolder/catchAsyn');
const AppError = require('./../errFolder/err');
const factory = require('./handlerFactory');
// exports.checkID = (req, res, next, val) => {
//   // eslint-disable-next-line no-console
//   console.log(`Tour id is: ${val}`);

//   // if (req.params.id * 1 > tours.length) {
//   //   return res.status(404).json({
//   //     status: 'fail',
//   //     message: 'Invalid ID'
//   //   });
//   // }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };
const multerStorge = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
   cb(null, true)
  }
  else 
  cb(new AppError('Not an image! please upload only imageg',400),false)
}

const upload = multer({
  storage:multerStorge,
  fileFilter:multerFilter
});

exports.resizeTourImages = catchAsync(async (req, res, next) =>{
  if(!req.files) return next();
  //1)for ImageCover
  if(req.files.imageCover){
  const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer).
        resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        //.toFile دي بعد مابتخزنها في الميموري بتخليك تخزنها في الديسك عادي 
        .toFile(`public/img/tours/${imageCoverFilename}`); 
        req.body.imageCover = imageCoverFilename;}
  
  //2)For Images
  if(req.files.images){
  req.body.images=[];
  //why i use map rather than foreach? becauce await return promise and foreach doesn't return promise but map do it 
  await Promise.all(req.files.images.map(async (file, index) =>{
    const Filename = `tour-${req.params.id}-${Date.now()}-${index+1}.jpeg`;
    await sharp(file.buffer)
        .resize(2000,1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        //.toFile دي بعد مابتخزنها في الميموري بتخليك تخزنها في الديسك عادي 
        .toFile(`public/img/tours/${Filename}`); 
        req.body.images.push(Filename);
  }));
}
  next();
});

exports.uploadTourImages = upload.fields([
  {name:'imageCover',maxCount:1,},{name:'images',maxCount:3}
]);

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.convertIdToName =async id=>{
  const tour = await Tour.findById(id);
  if (!tour) {
    return next(new AppError(`There is no tour with id ${id}`, 404));
  }
  return tour.name;
}
exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        avgRating: {
          $avg: '$ratingsAverage'
        },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 }
      }
    },
    {
      $sort: { numTours: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {//دي زي if بتعمل فيلتر للديكومنتس اللي هتدخل
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {//دي الحاجات اللي هتظهر في الres
        _id: { $month: '$startDates' },
        numTour: { $count: {} },
        nameTour: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      //دي بتختار حاجات معينه من الجروب 
      $project: { _id: 0 }//دي زي مش عايزين حقل الid معانا
    },
    { $sort: { numTour: -1 } },
    { $limit: 12 }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});
// tours/233/centre/-40,45/unit/ml
// /tours-within/:distance/center/:latlng/unit/:unit
exports.getTourWithin= catchAsync( async(req, res, next)=>{
  const {distance,latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
  if(!lat || !lng) return next(new AppError('please provide a latitutr and longitude in the format alt,lng ',400));
 //دي تحويله لو ب ملي والكيلو متر بس بالنسبه لكوكب الارض ودي بتتحفظ
  const radius = unit==='mi'? distance/3963.2: distance/6378.1;
  
  //احفظها زي ماهيا
  const tours = await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});
  res.status(200).json({
    status:'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});
exports.getDistances= catchAsync( async(req, res, next)=>{
  const {latlng,unit}=req.params;
  const [lat,lng]=latlng.split(',');
  if(!lat || !lng) return next(new AppError('please provide a latitutr and longitude in the format alt,lng ',400));
  //لو الوحده ميل بضرب في الرقم ده لو مش ميل بقسم علي الف
  const multiplier = unit === 'mi'? 0.000621371: 0.0001;
  const distance = await Tour.aggregate([
    //لازم عشان تعمل دي تبقي عامل index للاسكيما دي وعاملها  ثنائيه تو دي
    {
      //$geoNear دي الوحيده الموجوده في aggregate للموقع الجغرافي
     //دي لازم تبقي اول حاجه ماينفعش ماتش قبلها ولا اي حاجه حتي في الكويري ميدل ووير لازم دي تبقي الاولي
      $geoNear:{
        near:{
          type: 'Point',
          coordinates:[lng*1,lat*1]
        },
        //distaceFiled دي اجباري بردو و distance بتشير الي القيم اللي هتطلع هتروح في الديتنت فيلض
        distanceField: 'distance',
        //دي لازم اعملها بتحولي من المتر لكيلو متر ودي بتتحفظ مينفعش اعملها اي اسم وخلاص  
        distanceMultiplier:multiplier
      },     
    },{
      $project:{
        distance:1,
        name:1,  
        _id:0    
      }
    }
  ]);
    res.status(200).json({
    status:'success',
    results: distance.length,
    data: {
      data: distance
    }
  });
});
