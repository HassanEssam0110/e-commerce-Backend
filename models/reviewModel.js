const mongoose = require('mongoose');
const productModel = require('./productModel')

const reviewSchema = new mongoose.Schema({
    title: { type: String },
    rating: {
        type: Number,
        min: [1, "Min rating value is 1.0"],
        max: [5, "Max rating value is 5.0"],
        required: [true, "review rating required"]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "Review must belong to user"]
    },
    // parent reference (one to many)
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, "Review must belong to user"]
    }
}, { timestamps: true });


// to create populate user fild
reviewSchema.pre(/^find/, function (next) {
    this.populate({ path: 'user', select: 'name profileImg' });
    next();
})

// Makr agregation function to calculate avg rating and quantity rating 
reviewSchema.statics.calcAvgRatingAndQuantityRating = async function (productId) {
    const result = await this.aggregate([
        // Stage 1: Filter to get all reviews in specific Product
        { $match: { product: productId } },
        // Stage 2: Grouping reviews based on productId and calc avg rating and quantity rating 
        { $group: { _id: 'product', ratingsAvg: { $avg: "$rating" }, ratingsQuantity: { $sum: 1 } } }
    ])

    if (result.length > 0) {
        await productModel.findOneAndUpdate(productId, {
            ratingsAverage: Math.round(result[0].ratingsAvg * 10) / 10,
            ratingsQuantity: result[0].ratingsQuantity
        })
    } else {
        await productModel.findOneAndUpdate(productId, {
            ratingsAverage: 0,
            ratingsQuantity: 0
        })
    }
}

// call aggregate fun when save review
reviewSchema.post("save", async function () {
    await this.constructor.calcAvgRatingAndQuantityRating(this.product)
})

// call aggregate fun when remove review
reviewSchema.post("remove", async function () {
    await this.constructor.calcAvgRatingAndQuantityRating(this.product)
})


module.exports = mongoose.model('Review', reviewSchema);