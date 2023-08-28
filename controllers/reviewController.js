const factory = require('./handlersFactory');
const ReviewModel = require('../models/reviewModel');



//nested Route to work with subCategorien at same category
//  -- Middliwares --
//@desc    make filter and get all reviews with same product id
// GET     /api/v1/products/:productId/reviews
exports.createFilterObj = (req, res, next) => {
    //Nested route
    let filterObject = {};
    if (req.params.productId) {
        filterObject = { product: req.params.productId }
    }
    req.filterObj = filterObject;
    next();
}


//@desc    Get list of Reviews
//@route   Get   /api/v1/reviews
//@access  Public
exports.getReviews = factory.getAll(ReviewModel);

//@desc    Get specific Reviews by id
//@route   Get   /api/v1/reviews/:id
//@access  Public
exports.getReview = factory.getOne(ReviewModel);


//nested Route to work with reviews at same product
//  -- Middliwares --
//@desc    add req.body.product
// POST    /api/v1/products/:productId/reviews
exports.setProductIdToAndUserIdBody = (req, res, next) => {
    //Nested route
    if (!req.body.product)
        req.body.product = req.params.productId;

    if (!req.body.user)
        req.body.user = req.user._id;

    next();
}


//@desc    Create new Reviews
//@route   POST   /api/v1/reviews
//@access  Private/Protect/User
exports.createReview = factory.createOne(ReviewModel);



//@desc    Update specific Reviews
//@route   PUT   /api/v1/reviews/:id
//@access  Private/Protect/User
exports.updateReview = factory.updateOne(ReviewModel);


//@desc    Delete specific Reviews
//@route   DELETE   /api/v1/reviews/:id
//@access  Private/Protect/User-admin-manager
exports.deleteReview = factory.deleteOne(ReviewModel);

