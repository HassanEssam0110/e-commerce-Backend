const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    cartItems: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1,
        },
        color: String,
        size: String,
        price: Number
    }],
    totalCartPrice: Number,
    totalPriceAfterDiscount: Number,
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);