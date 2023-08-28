const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Product title is required'],
        minlenght: [3, "Too short product title"],
        maxlenght: [100, "Too long product title"]
    },
    slug: {
        type: String,
        required: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        minlenght: [20, "Too short product descriotion"],
        maxlenght: [2000, "Too long product descriotion"]
    },
    quantity: {
        type: Number,
        required: [true, "Product quantity is required"]
    },
    sold: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        trim: true,
        required: [true, "Product price is required"],
        max: [200000, "Too long product price"]
    },
    priceAfterDiscount: {
        type: Number,
    },
    colors: [String],
    size: [String],
    imageCover: {
        type: String,
        required: [true, "Product image Cover is required"]
    },
    images: [String],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, "Product must be belong to Category"]
    },
    subcategories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'SubCategory',
    }],
    brand: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Brand',
    }],
    ratingsAverage: {
        type: Number,
        min: [1, "Rating must be above or equal 1.0"],
        max: [5, "Rating must be below or equal 5.0"]
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    }
},
    {
        timestamps: true,
        // to enable virtual populate
        toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
        toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
    })




//Mongose query middleware to papulate
productSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'category',
        select: 'name'
    });
    this.populate({
        path: 'subcategories',
        select: 'name'
    });

    next();
})


//  Make virtual populate to get reviews as virtual field  by link two Models
// Creating and populating virtual property 'reviews' in product schema
// will populate the documents from review collection if 
// their '_id' matches with the 'product' of the review
productSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'product', //of review collection
    localField: '_id' // of product collection
})





// custom image url
const setImageURL = (doc) => {
    if (doc.imageCover) {
        const imageURL = `${process.env.BASE_URL}/products/${doc.imageCover}`;
        doc.imageCover = imageURL;
    }

    if (doc.images) {
        const imageList = [];

        doc.images.forEach((img) => {
            const imageURL = `${process.env.BASE_URL}/products/${img}`;
            imageList.push(imageURL);
        })

        doc.images = imageList;
    }

}


//Mongoose Middleware work with findOne , findAll , Update 
productSchema.post('init', (doc) => {
    setImageURL(doc);
});

//Mongoose Middleware work with create 
productSchema.post('save', (doc) => {
    setImageURL(doc);
});



module.exports = mongoose.model('Product', productSchema);
