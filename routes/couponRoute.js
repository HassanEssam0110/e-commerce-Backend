const express = require('express');
const { createCoupon, getCoupons, getCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const { addCouponValidator, removeCouponValidator, updateCouponValidator, getCouponValidator } = require('../utils/validators/couponValidators')
// const { getBrandValidator, createBrandValidator, updateBrandValidator, deleteBrandValidator } = require('../utils/validators/brandValidators')
const authService = require('../services/authService');

const router = express.Router();


router.use(authService.protect, authService.allowedTo('admin', 'manager'))

router.route('/')
    .get(getCoupons)
    .post(addCouponValidator, createCoupon)

router.route('/:id')
    .get(getCouponValidator, getCoupon)
    .put(updateCouponValidator, updateCoupon)
    .delete(removeCouponValidator, deleteCoupon)


module.exports = router;