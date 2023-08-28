const SubCategoryModel = require('../models/subCategoryModel');
const factory = require('./handlersFactory')



//nested Route to work with subCategorien at same category
//  -- Middliwares --

//@desc    add req.body.category
// POST    /api/v1/categories/:categoryId/subcategories
exports.setCategoryIdToBody = (req, res, next) => {
    //Nested route
    if (!req.body.category)
        req.body.category = req.params.categoryId;
    next();
}

//@desc    make filter and get all subcategories with same category id
// GET     /api/v1/categories/:categoryId/subcategories
exports.createFilterObj = (req, res, next) => {
    //Nested route
    let filterObject = {};
    if (req.params.categoryId) {
        filterObject = { category: req.params.categoryId }
    }
    req.filterObj = filterObject;
    next();
}



// ---------------------------------------------------------------------------------------------

//@desc    Get list of SubCategories
//@route   Get   /api/v1/subcategories
//@access  Public
exports.getSubCategories = factory.getAll(SubCategoryModel);


//@desc    Get specitic SubCategories by id
//@route   Get   /api/v1/subcategories/:id
//@access  Public
exports.getSubCategory = factory.getOne(SubCategoryModel);


//@desc    Create new subCategory
//@route   POST   /api/v1/subcategories
//@access  Private/admin-manager
exports.createSubCategory = factory.createOne(SubCategoryModel);


//@desc    Update specitic Categories
//@route   PUT   /api/v1/subcategories/:id
//@access  Private/admin-manager
exports.updateSubCategory = factory.updateOne(SubCategoryModel);


//@desc    Delete specitic Categories
//@route   DELETE   /api/v1/subcategories/:id
//@access  Private/admin only
exports.deleteSubCategory = factory.deleteOne(SubCategoryModel);
