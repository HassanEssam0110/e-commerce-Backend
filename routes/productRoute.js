const express = require('express');
const { getProduct, getProducts, createProduct, deleteProduct, updateProduct, uploadProductImages, resizeProductImages } = require('../controllers/productController');
const { getProductValidator, updateProductValidator, createProductValidator, deleteProductValidator } = require('../utils/validators/productValidators')
const authService = require('../services/authService');
const reviewRoute = require('./reviewRoute')

const router = express.Router();


// Nested route
router.use('/:productId/reviews', reviewRoute)

router.route('/')
    .get(getProducts)
    .post(authService.protect, authService.allowedTo('admin', 'manager'), uploadProductImages, resizeProductImages, createProductValidator, createProduct)

router.route('/:id')
    .get(getProductValidator, getProduct)
    .put(authService.protect, authService.allowedTo('admin', 'manager'), uploadProductImages, resizeProductImages, updateProductValidator, updateProduct)
    .delete(authService.protect, authService.allowedTo('admin'), deleteProductValidator, deleteProduct)


module.exports = router;