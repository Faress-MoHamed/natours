const express = require('express');
const se = require('sequelize')
const ReviewController = require('./../controllers/ReviewController');
const authController = require('./../controllers/authController');

const Route = express.Router({ mergeParams: true });
Route.use(authController.protect);
Route.route('/')
  .get(ReviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    ReviewController.setTourUserId,
    ReviewController.createNewReview
  );

Route.route('/:id')
  .delete(
    authController.restrictTo('user', 'admin'),
    ReviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    ReviewController.updateReview
  )
  .get(ReviewController.getReview);
module.exports = Route;
