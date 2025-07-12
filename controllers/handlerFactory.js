/* eslint-disable node/no-unsupported-features/es-syntax */
const catchAsync = require('./../errFolder/catchAsyn');
const AppError = require('./../errFolder/err');
const APIFeature = require('./../findApi/api');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new AppError(`There is no ${Model.name} with id ${req.params.id}`, 404)
      );
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      return next(
        new AppError(`There is no ${Model.name} with id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: doc
      }
    });
  });

exports.getOne = (Model, popOption) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (popOption) query.populate(popOption);
    const doc = await query;
    if (!doc) {
      return next(
        new AppError(`There is no ${Model.name} with id ${req.params.id}`, 404)
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // eslint-disable-next-line prettier/prettier
   let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //Bulid query
    const features = new APIFeature(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    // const doc = await features.query.explain();
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc
      }
    });
  });
