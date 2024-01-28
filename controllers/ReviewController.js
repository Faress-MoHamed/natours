const Review = require('./../model/ReviewModel');
const factory = require('./handlerFactory');

exports.getAllReview = factory.getAll(Review);
exports.setTourUserId = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
}
exports.createNewReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.UpdateOne(Review);
exports.getReview = factory.getOne(Review);