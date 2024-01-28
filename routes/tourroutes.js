const express = require('express');
const tourcontrller = require('./../controllers/tourcontroller');
const authcontroller = require('./../controllers/authController');
const reviewRouter = require('./../routes/ReviewRoute');
const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);
router
  .route('/Top-5-cheap')
  .get(tourcontrller.aliasTopTours, tourcontrller.getAllTours);

router.route('/getStat').get(tourcontrller.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide', 'guide'),
    tourcontrller.getMonthlyPlan
  );
router
  .route('/:id')
  .get(tourcontrller.getTour)
  .patch(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontrller.UpdateTour
  )
  .delete(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontrller.deleteTour
  );
router
  .route('/')
  .get(authcontroller.protect, tourcontrller.getAllTours)
  .post(
    authcontroller.protect,
    authcontroller.restrictTo('admin', 'lead-guide'),
    tourcontrller.createTour
);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourcontrller.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourcontrller.getDistances);

module.exports = router;
