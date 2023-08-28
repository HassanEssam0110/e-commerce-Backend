const asyncHandler = require('express-async-handler');
const ApiFeatures = require('../utils/ApiFeatuers');
const ApiError = require('../utils/ApiError');



exports.deleteOne = (Model) => asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id)

    if (!document) {
        // res.status(404).json({ msg: `No Category for this id ${id}` })
        return next(new ApiError(`No document found for this id:'${req.params.id}'`, 404))
    }

    // Trigger 'remove' event when delete document
    document.remove();

    //  res.status(204).send();
    res.status(200).json({ message: `The document:'${document.name || document.title}' has been successfully deleted.` });
})


exports.updateOne = (Model) => asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true })

    if (!document) {
        return next(new ApiError(`No document found for this id:'${req.params.id}'`, 404))
    }

    // Trigger 'save' event when update document
    document.save();
    res.status(200).json({ data: document });
})


exports.createOne = (Model) => asyncHandler(async (req, res, next) => {
    const newDocument = await Model.create(req.body);

    res.status(201).json({ data: newDocument });
})

exports.getOne = (Model, populationOpt) => asyncHandler(async (req, res, next) => {
    //1) Buld Query
    const query = Model.findById(req.params.id)

    if (populationOpt) {
        query.populate(populationOpt)
    }

    // 2) Execute Query
    const document = await query
    if (!document) {
        // res.status(404).json({ msg: `No Category for this id ${id}` })
        return next(new ApiError(`No found document for this id:'${req.params.id}'`, 404))
    }
    res.status(200).json({ data: document });

})

exports.getAll = (Model, modelName = ' ') => asyncHandler(async (req, res, next) => {
    //recive filterobject to make filter in nested route get subCategories at same category
    let filter = {};
    if (req.filterObj) {
        filter = req.filterObj
    }

    // Build Query 
    const documentCounts = await Model.countDocuments();//to get number of documents
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
        .paginate(documentCounts)
        .filter()
        .search(modelName)
        .limitFields()
        .sort()

    // Execute Query 
    const { mongooseQuery, paginationResult } = apiFeatures
    const documents = await mongooseQuery;

    res.status(200).json({ results: documents.length, paginationResult, data: documents });
})