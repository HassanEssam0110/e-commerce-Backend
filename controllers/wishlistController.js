const asyncHandler = require('express-async-handler');
const userModel = require('../models/userModel');

//@desc    Add product to wishlist
//@route   POST  /api/v1/wishlist
//@access  Protected/user
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
    // $addToSet : add productId to wishlist array if productId is not exsist
    const user = await userModel.findByIdAndUpdate(req.user._id, {
        $addToSet: { wishlist: req.body.productId }
    }, { new: true })


    res.status(200).json({ status: 'success', message: 'Product added successfully to your wishlisy.', data: user.wishlist })
})

//@desc    Remove product from wishlist
//@route   DELETE  /api/v1/wishlist/:productId
//@access  Protected/user
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
    // $pull : remove productId to wishlist array if productId is exsist
    const user = await userModel.findByIdAndUpdate(req.user._id, {
        $pull: { wishlist: req.params.productId }
    }, { new: true })


    res.status(200).json({ status: 'success', message: 'Product removed successfully from your wishlisy.', data: user.wishlist })
})



//@desc    Get products from wishlist
//@route   GET  /api/v1/wishlist
//@access  Protected/user
exports.GetLoggedUserWishlist = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id).populate({ path: 'wishlist', })


    res.status(200).json({ status: 'success', results: user.wishlist.length, data: user.wishlist })
})