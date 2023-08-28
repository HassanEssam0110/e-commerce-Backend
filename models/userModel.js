const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "User Name required"]
    },
    slug: {
        type: String,
        lowercase: true,
    },
    email: {
        type: String,
        required: [true, "User email required"],
        unique: [true, "User email is already taken. Please provide a unique email address."],
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String
    },
    profileImg: {
        type: String
    },
    password: {
        type: String,
        required: [true, "Password required"],
        minlength: [8, "Too short password"]
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
        type: String,
        enum: ['admin', 'manager', 'user'],
        default: 'user'
    },
    active: {
        type: Boolean,
        default: true
    },
    activeResetCode: String,
    activeResetExpires: Date,
    activeResetVerified: Boolean,
    // child reference (one to many)
    wishlist: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
    }],
    addresses: [{
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postalCode: String
    }],
}, { timestamps: true })



// encrypt password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    // Hashing Password
    this.password = await bcrypt.hash(this.password, 12);
    next();
})



// custom image url
const setImageURL = (doc) => {
    if (doc.profileImg) {
        const imageURL = `${process.env.BASE_URL}/users/${doc.profileImg}`;
        doc.profileImg = imageURL;
    }
}


//Mongoose Middleware work with findOne , findAll , Update 
UserSchema.post('init', (doc) => {
    setImageURL(doc);
});

//Mongoose Middleware work with create 
UserSchema.post('save', (doc) => {
    setImageURL(doc);
});



const userModel = mongoose.model('User', UserSchema);
module.exports = userModel;



