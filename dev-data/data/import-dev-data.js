const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../model/TourModel');
const User = require('./../../model/userModel');
const Review = require('./../../model/ReviewModel');
dotenv.config({ path: './config.env' });
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('--'.repeat(10));
  });
//Read Json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//import data to db
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users,{validatorBeforeSave:false});
    await Review.create(reviews);
    console.log('datat successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//delete all datat from Db
const DeleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  DeleteData();
}
