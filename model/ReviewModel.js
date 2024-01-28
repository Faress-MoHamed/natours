const mongoose = require('mongoose');
const Tour = require('./TourModel');
const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'review cant be empty'],
      trim: true,
    },
    raiting: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    tour: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to Tour'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to User'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


ReviewSchema.statics.CalcAverageRaiting = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRaiting: { $sum: 1 },
        avgRaiting: { $avg: '$raiting' },
      },
    },
  ]);
  console.log(stats);
  if (stats.lenght > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRaiting,
      ratingsQuantity: stats[0].nRaiting,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,//default
      ratingsQuantity: 0,
    });
  }
  
}

ReviewSchema.post('save', function () {
  //this points to current review
  this.constructor.CalcAverageRaiting(this.tour);
});
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  console.log(this.r)
})

ReviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.CalcAverageRaiting(this.r.tour);
})

ReviewSchema.pre(/^find/, function (next) {
  this.populate([
    {
      path: 'user',
      select: 'name email role',
    },
  ]);
  next();
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
