const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt')

const factory = require('./handlersFactory');
const ApiError = require('../utils/ApiError');
const generateToken = require('../utils/generateToken');
const { uploadSingleImage } = require('../middlewares/uploadImageMiddleware')
const userModel = require('../models/userModel');


// use Middleware multer to uplaod single image
exports.uploadUserImage = uploadSingleImage('profileImg');

//use  Middleware Image processing sharp to resize image and quality 
exports.resizeImage = asyncHandler(async (req, res, next) => {
    const fileName = `user-${uuidv4()}-${Date.now()}.jpeg`

    if (req.file) {
        await sharp(req.file.buffer)
            .resize(600, 600)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`uploads/users/${fileName}`)

        //save image name in our DB
        req.body.profileImg = fileName;
    }

    next();
})


//  ----------- Admin -----------

//@desc    Get list of users
//@route   Get   /api/v1/users
//@access  Private/Protect/admin only
exports.getUsers = factory.getAll(userModel);

//@desc    Get specitic user by id
//@route   Get   /api/v1/users/:id
//@access  Private/Protect/admin only
exports.getUser = factory.getOne(userModel);


//@desc    Create new user
//@route   POST   /api/v1/users
//@access  Private/Protect/admin only
exports.createUser = factory.createOne(userModel);


//@desc    Update specitic user
//@route   PUT   /api/v1/users/:id
//@access  Private/Protect/admin only
exports.updateUser = asyncHandler(async (req, res, next) => {
    const document = await userModel.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        slug: req.body.slug,
        phone: req.body.phone,
        email: req.body.email,
        profileImg: req.body.profileImg,
        role: req.body.role
    }, { new: true })

    if (!document) {
        return next(new ApiError(`No User found for this id:'${req.params.id}'`, 404))
    }

    res.status(200).json({ data: document });
})


//@desc    change password specitic user
//@route   PUT   /api/v1/users/changePassword/:id
//@access  Private/Protect/admin only
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
    const newPassword = await bcrypt.hash(req.body.password, 12);
    const document = await userModel.findByIdAndUpdate(req.params.id, {
        password: newPassword,
        passwordChangedAt: Date.now()
    }, { new: true });
    if (!document) {
        return next(new ApiError(`No User found for this id:'${req.params.id}'`, 404))
    }
    res.status(200).json({ data: document });
})


//@desc    Delete specitic user
//@route   DELETE   /api/v1/users/:id
//@access  Private/Protect/admin only
exports.deleteUser = factory.deleteOne(userModel);




//  ----------- Logged user -----------

//@desc    Get logged user data
//@route   Get   /api/v1/users/getMe
//@access  Private/Protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
    req.params.id = req.user._id;
    next();
});


//@desc    change logged user password 
//@route   PUT   /api/v1/users/changeMyPassword
//@access  Private/Protect
exports.changeLoggedUserPassword = asyncHandler(async (req, res, next) => {
    // 1) update user password based user payload (req.user._id)
    const newPassword = await bcrypt.hash(req.body.password, 12);
    const user = await userModel.findByIdAndUpdate(req.user._id, {
        password: newPassword,
        passwordChangedAt: Date.now()
    }, { new: true });

    if (!user) {
        return next(new ApiError(`No User found for this id:'${req.user._id}'`, 404))
    }

    // 2) Generate a new token
    const token = generateToken({ userId: user._id });

    res.status(200).json({ data: user, token });
})


//@desc    Update logged user data
//@route   PUT   /api/v1/users/updateMe
//@access  Private/Protect
exports.updateLoggedUser = asyncHandler(async (req, res, next) => {
    const updatedUser = await userModel.findByIdAndUpdate(req.user._id,
        {
            name: req.body.name,
            slug: req.body.slug,
            phone: req.body.phone,
            email: req.body.email,
            profileImg: req.body.profileImg,

        }, { new: true })

    if (!updatedUser) {
        return next(new ApiError(`No User found for this id:'${req.user._id}'`, 404))
    }

    res.status(200).json({ data: updatedUser });
})


//@desc    Deactive logged user Account
//@route   PUT   /api/v1/users/deactivateMe
//@access  Private/Protect
exports.deactivateLoggedUser = asyncHandler(async (req, res, next) => {
    const deactivatedUser = await userModel.findByIdAndUpdate(req.user._id, { active: false });

    if (!deactivatedUser) {
        return next(new ApiError(`No User found for this id:'${req.user._id}'`, 404))
    }
    res.status(200).json({ status: 'success', message: "This user is deactivated now" });
});

