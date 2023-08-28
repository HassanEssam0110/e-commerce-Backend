const mongoose = require('mongoose');

//1-create Schema
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Brand name is required'],
        unique: [true, 'Brand name must be unique'],
        minlength: [3, 'TOO short Brand name'],
        maxlength: [30, 'TOO long Brand name']
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
        const imageURL = `${process.env.BASE_URL}/brands/${doc.image}`;
        doc.image = imageURL;
    }
}


//Mongoose Middleware work with findOne , findAll , Update 
brandSchema.post('init', (doc) => {
    setImageURL(doc);
});

//Mongoose Middleware work with create 
brandSchema.post('save', (doc) => {
    setImageURL(doc);
});





//2-create Model
const brandModel = mongoose.model('Brand', brandSchema);

module.exports = brandModel;