const Tour = require('./../model/TourModel');
const catchAsync = require('../utils/catchAsync');

exports.getOverview =catchAsync(async (req, res) => {
  //1)get tour data from collection (model)
  const tours = await Tour.find();
  //2) build template
  //3)Render that template using tour from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

exports.getTour =catchAsync(async (req, res) => {
  //1)get the requested tour
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields:'review raiting user'
  })
  await tour.save();
  
  //2)build template
  //3)render template
  res.status(200).render('tour', {
    title: 'The forest hiker Tour',
    tour
  });
});
