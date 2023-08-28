const mongoose = require('mongoose');
//1-create Schema
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Category name is required'],
        unique: [true, 'Category name must be unique'],
        minlength: [3, 'TOO short category name'],
        maxlength: [30, 'TOO long category name']
    },
    //A and B => shoping.com/a-and-b
    slug: {
        type: String,
        lowercase: true,
    },
    image: { type: String }
},
    { timestamps: true }
);

// custom image url
const setImageURL = (doc) => {
    if (doc.image) {
        const imageURL = `${process.env.BASE_URL}/categories/${doc.image}`;
        doc.image = imageURL;
    }
}


//Mongoose Middleware work with findOne , findAll , Update 
categorySchema.post('init', (doc) => {
    setImageURL(doc);
});

//Mongoose Middleware work with create 
categorySchema.post('save', (doc) => {
    setImageURL(doc);
});



//2-create Model
const categoryModel = mongoose.model('Category', categorySchema);

module.exports = categoryModel;