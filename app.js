/* eslint-disable import/newline-after-import */
/* eslint-disable no-undef */
/* eslint-disable import/order */
/* eslint-disable no-unused-vars */
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit'); //بيجيب عدد الريكوست كحمايه من ان نفس الip يعمل كذا ريكوست فيوقع السيرفر
const session = require('express-session');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./errFolder/err');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const compression = require('compression');
const cors = require('cors');

//todo Start Express App
const app = express();
//* implement CORS دي بتخلي لو انت في سيرفر او دومين تاني وطلبت تاخد api بيسمحلك عادي من غيرها اي حد غير الجهاز بتاعك مش هيعرف يوصل للapi
//& app.use('/api/v1/tours',cors(), tourRouter); كنت ممكن اعملها كدا لو عايز مفيش اي حد يوصل ل api غير ال /api/v1/tours ده اللي يقدر يتشاف
//? if my domin is api.natours.com and the domin frontend is api.natours.com you can use app.use(cors({origin: 'api.natours.com}));
app.use(cors());

//دي بتخلي ال cors تمشي علي كل العمليات زي delete patch get post put
app.options('*', cors());
app.enable('trust proxy');
app.use(
  session({
    secret: 'your-secret-key', // قم بتبديل 'your-secret-key' بمفتاح سري فريد وآمن
    resave: false,
    saveUninitialized: true
  })
);

//دي بستخدمها عان ريند للويب بيج لازم تعملها انستول
app.set('view engine', 'pug');
//بقوله فين مكان الريندر اللي هيحصل
app.set('views', path.join(__dirname, 'views'));

//serving static files
app.use('/public/css', express.static('public/css'));

app.use(express.static(path.join(__dirname, 'public')));

//set secuirty http Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com'
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network'
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https:',
          'https://q.stripe.com',
          'https://js.stripe.com',
          'https://stripe-camo.global.ssl.fastly.net',
          'https://d1wqzb5bdbcre6.cloudfront.net',
          'https://qr.stripe.com',
          'https://b.stripecdn.com',
          'https://files.stripe.com',
          'https://www.google.com'
        ], // أضف المصدر الجديد هنا
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/'
        ],
        upgradeInsecureRequests: []
      }
    }
  })
);

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
const limiter = rateLimit({
  //اقصي حاجه تعمل مئه ريكوست في الساعه بعدها هيجيلك الماسدج دي
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); //اي ريكوست بيبدا ب كلمه api

//دي خاصه  بstripe لي معملتها في البوكينج لان انا في السطر اللي تحت قايل ان اكسبريس هيستعمل البادي جيسون وانا عايزها بادي استرينج
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//Body parsing , reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
//لما اعمل submit ل form الداتا اللي في الحقول تروح ل req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Data sanitization against nosql query injection اكتب في الريكوست اوامر مونجو
app.use(mongoSanitizer());
// Data sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
); //مثلا لو كتبت في url ?sort=duration&sort=price  في الحاله العاديه هيدي ايرور انما بعد استخدامه يعمل سورت من غير مايجيب ايرور
//
//بيضغط الحاجات ماعادا الصور لانها مضغوطه
app.use(compression());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
