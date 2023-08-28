const asyncHandler = require('express-async-handler');
const userModel = require('../models/userModel');

//@desc    Add address to user addresses array
//@route   POST  /api/v1/addresses
//@access  Protected/user
exports.addAddress = asyncHandler(async (req, res, next) => {
    // $addToSet : add address objext to user addresses array if address objext is not exsist
    const user = await userModel.findByIdAndUpdate(req.user._id, {
        $addToSet: { addresses: req.body }
    }, { new: true })


    res.status(200).json({ status: 'success', message: 'Address added successfully.', data: user.addresses })
})

//@desc    Remove address from addresses array
//@route   DELETE  /api/v1/addresses/:addressId
//@access  Protected/user
exports.removeAddress = asyncHandler(async (req, res, next) => {
    // $pull : remove address object from  addresses array if address is exsist
    const user = await userModel.findByIdAndUpdate(req.user._id, {
        $pull: { addresses: { _id: req.params.addressId } }
    }, { new: true })


    res.status(200).json({ status: 'success', message: 'Address removed successfully.', data: user.addresses })
})



//@desc    Get Addresses from user Addresses list
//@route   GET  /api/v1/addresses
//@access  Protected/user
exports.GetLoggedUserAddresses = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id).populate('addresses')

    res.status(200).json({ status: 'success', results: user.addresses.length, data: user.addresses })
})