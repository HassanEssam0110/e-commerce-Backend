const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Coupon name is required.'],
        unique: [true, 'Coupon name is unique.'],
    },
    expires: {
        type: Date,
        required: [true, 'Coupon Expire is requires.']
    },
    discount: {
        type: Number,
        required: [true, 'Coupon discount is reqired.']
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('Coupon', couponSchema)