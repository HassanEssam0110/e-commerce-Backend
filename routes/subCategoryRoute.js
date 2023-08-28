const express = require('express');
const { createSubCategory, deleteSubCategory, getSubCategories, getSubCategory, updateSubCategory, createFilterObj, setCategoryIdToBody } = require('../controllers/subCategoryController');
const { getSubCategoryValidator, createSubCategoryValidator, updateSubCategoryValidator, deleteSubCategoryValidator } = require('../utils/validators/subCategoryValidators');
const authService = require('../services/authService');



//mergeParams : Allow us to access parameters on other routers
//ex: we need to acceess categoryId from category router
const router = express.Router({ mergeParams: true });


router.route('/')
    .get(createFilterObj, getSubCategories)
    .post(authService.protect, authService.allowedTo('admin', 'manager'), setCategoryIdToBody, createSubCategoryValidator, createSubCategory)

router.route('/:id')
    .get(getSubCategoryValidator, getSubCategory)
    .put(authService.protect, authService.allowedTo('admin', 'manager'), updateSubCategoryValidator, updateSubCategory)
    .delete(authService.protect, authService.allowedTo('admin'), deleteSubCategoryValidator, deleteSubCategory)


module.exports = router;