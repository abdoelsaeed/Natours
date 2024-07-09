/* eslint-disable no-plusplus */
/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/newline-after-import */
/* eslint-disable no-unused-vars */
const multer = require('multer');
const sharp = require('sharp');
const User = require('./../model/userModle');
const catchAsync = require('./../errFolder/catchAsyn');
const AppError = require('./../errFolder/err');
const factory = require('./handlerFactory');

//ده لو عايز تحفظ الصوره من غير ماتعدل عليها
// لي عملتلها كومنت لان دي هتخزن الصور في الديسك وانا عايزها في الميموري عشان لسه هعدل عليها قبل ماتتحفظ عشان كده هستخدم بتاعت الmemory
// const multerStorge = multer.diskStorage({
//   destination: (req,file,cb)=>{
//     //cb such as call back func next( )  if null true else return AppError
//     cb(null , 'public/img/users');
//   },
//   filename: (req,file,cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     //user-id-تاريخ -jpg مثلا
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorge = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
   cb(null, true)
  }
  else 
  cb(new AppError('Not an image! please upload only image',400),false)
}

const upload = multer({ 
  storage:multerStorge,
  fileFilter:multerFilter
 });

//photo لازم يكون نفس الاسم في الداتا بيز
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res,next) =>{
  if(!req.file)return next();

  //.jpeg لان قايلوا تحت toFormat خليهم كلهم 
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`
  await sharp(req.file.buffer).
        resize(500,500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        //.toFile دي بعد مابتخزنها في الميموري بتخليك تخزنها في الديسك عادي 
        .toFile(`public/img/users/${req.file.filename}`);
  next();
});

const filterObj=(bodyObj,...allowedFildes)=>{
  const newObj = {};
Object.keys(bodyObj).forEach(el=>{
  if(allowedFildes.includes(el)){
newObj[el] = bodyObj[el];
  }
});
return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'This route is not for password or confirm password. Please user /updatepassword.',
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name','email');
  if(req.file){
    filteredBody.photo=req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  }); 
  res.status(200).json({
    status: 'success',
    data:{
      user
    }
  });
});

exports.getMe=(req,res,next)=>{
  req.params.id = req.user.id;
  next();
}

exports.deleteMe=catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {active:false},{new:true,
    runValidators: true
  });
  res.status(204).json({
    status:'success',
    data:null
  });
});

exports.lovedTour =catchAsync(async (req, res, next) => {
const user = await User.findById(req.user.id);
    if (!user) return next(new AppError('Tour not found', 404));
    if (!user.liked.includes(req.params.tourId)) {
   user.liked.push(req.params.tourId);
    } 

    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      status:'success',
      user
    })
  });
;

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);
