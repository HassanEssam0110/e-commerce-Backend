const mongoose = require('mongoose');


//1-create Schema
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        unique: [true, 'SubCategory title must be unique'],
        required: [true, 'SubCategory title is required'],
        minlength: [2, 'TOO short SubCategory title'],
        maxlength: [32, 'TOO long SubCategory title']
    },
    //A and B => shoping.com/a-and-b
    slug: {
        type: String,
        lowercase: true,
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: [true, 'SubCategory must be belong to parent Category'],
    }
},
    { timestamps: true }
);


//2-create Model
module.exports = mongoose.model('SubCategory', subCategorySchema);

