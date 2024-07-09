/* eslint-disable no-console */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './../../config.env' });

const Tour = require('./../../model/tourModle');
const User = require('./../../model/userModle');
const Review = require('./../../model/reviewModel');

const options = {
  autoIndex: true //this is the code I added that solved it all
};
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATEBASE_PASSWORD
);
mongoose
  .connect(db, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    options
  })
  .then(() => console.log('DB connection successful!'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//import Data into DB
const importData = async () => {
  try {
    const tour = await Tour.create(tours);
    const user = await User.create(users, { validateBeforeSave: false });
    const review = await Review.create(reviews);

    console.log('The Import Done!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
//Delete All Data From DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('The Delete Done!!!!!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
module.exports = db;
