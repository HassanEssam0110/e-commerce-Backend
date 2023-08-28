const factory = require('./handlersFactory');
const CouponModel = require('../models/couponModel');

//@desc    Get list of Coupons
//@route   Get   /api/v1/coupons
//@access  Private/admin-manager
exports.getCoupons = factory.getAll(CouponModel);

//@desc    Get specific Coupon by id
//@route   Get   /api/v1/coupons/:id
//@access  Private/admin-manager
exports.getCoupon = factory.getOne(CouponModel);


//@desc    Create new Coupon
//@route   POST   /api/v1/coupons
//@access  Private/admin-manager
exports.createCoupon = factory.createOne(CouponModel);



//@desc    Update specific Coupon
//@route   PUT   /api/v1/coupons/:id
//@access  Private/admin-manager
exports.updateCoupon = factory.updateOne(CouponModel);


//@desc    Delete specific Coupon 
//@route   DELETE   /api/v1/coupons/:id
//@access  Private/admin-manager
exports.deleteCoupon = factory.deleteOne(CouponModel);