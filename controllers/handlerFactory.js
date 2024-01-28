const AppError = require('../utils/AppError');
const catchAsync = require('./../utils/catchAsync');
const APIfeauture = require('./../utils/apitfeatures');

exports.deleteOne = (model) =>
  catchAsync(async (req, res) => {
    const doc = await model.findByIdAndDelete(req.params.id, {
      translateAliases: null,
    });
    if (!doc) {
      new AppError(`we don't have any ${model} with this id`, 404);
    }
    res.status(204).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.UpdateOne = (model) =>
  catchAsync(async (req, res) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      //new here to return the modifed document to send it and save it in <''doc''>
      new: true,
      runValidators: true,
    });
    if (!doc) {
      new AppError(`we don't have any ${model} with this id`, 404);
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.getOne = (model, popOption) =>
  catchAsync(async (req, res) => {
    let query = model.findById(req.params.id);
    if (popOption) query = query.populate(popOption);
    const doc = await query;
    if (!doc) {
      new AppError(`we don't have any ${model} with this id`, 404);
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });
exports.createOne = (model) =>
  catchAsync(async (req, res) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: doc,
      },
    });
  });
exports.getAll = (model) =>
  catchAsync(async (req, res,next) => {
    //for Review controller
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //
    const feature = new APIfeauture(model.find(), req.query)
      .filter()
      .limit()
      .sort()
      .pagination();
    const doc = await feature.query;
      if (!doc.length) {
        return next(new AppError(`we dont have any ${model}!`, 404));
      }
    //sending Data
    res.status(200).json({
      status: 'success',
      res: doc.length,
      data: {
        doc,
      },
    });
  });
