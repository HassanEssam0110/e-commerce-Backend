const crypto = require('crypto');

const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/sendMail');
const generateToken = require('../utils/generateToken');
const UserModel = require('../models/userModel');



//@desc       SignUp
//@route      POST /api/v1/auth/signup
//@access     public  
exports.signUp = asyncHandler(async (req, res, next) => {
    // 1) create user
    const newUser = await UserModel.create({
        name: req.body.name,
        slug: req.body.slug,
        email: req.body.email,
        password: req.body.password,
    })

    // 2) Generate token
    const token = generateToken({ userId: newUser._id });
    res.status(201).json({ data: newUser, token })
});



//@desc       login User
//@route      POST /api/v1/auth/login
//@access     public 
exports.login = asyncHandler(async (req, res, next) => {
    // 1) check if password and email in the body (validation MW)
    // 2) check if user is exist & check if email and password are valid 
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
        return next(new ApiError('Incorrect email or password', 401));
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
        return next(new ApiError('Incorrect email or password', 401));
    }

    // 3) Generate token
    const token = generateToken({ userId: user._id });
    // 4) send response to client side
    res.status(200).json({ data: user, token })
});


//@desc     make sure the user is logged in and authenticated
exports.protect = asyncHandler(async (req, res, next) => {
    // 1) check if token exist, if exist get
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError('You are not login, please login to get access this route.', 401))
    }

    // 2) verify token (no change happens, expired token)
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // 3) check if user exists.
    const currentUser = await UserModel.findById(decodedToken.userId);

    if (!currentUser) {
        return next(new ApiError("The user thst belong to this token doesn't exist ", 401))
    }

    // 4) check if user deactivated account 
    if (currentUser.active === false) {
        return next(new ApiError("Your account is deactivated,Please activate your account again", 401));
    }

    // 5) check if user change his password after token created
    if (currentUser.passwordChangedAt) {
        const passChangedAimestamp = parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10);

        // password changed after token created (Error)
        if (passChangedAimestamp > decodedToken.iat) {
            return next(new ApiError("User recently changed his password. please login again..", 401));
        }
    }

    req.user = currentUser;
    next();
});


// @desc   Authoriztion (user permissions)
// we access roles by closure: A closure is a feature of JavaScript that allows inner functions to access the outer scope of a function.
// ['manger','admin']
exports.allowedTo = (...roles) => asyncHandler(async (req, res, next) => {
    // 1) access roles
    // 2) access registered user (req.user.role)
    if (!roles.includes(req.user.role)) {
        return next(new ApiError('You are not allowed to access this route', 403))
    }

    next();
});



// ------------------  Forget Password   ------------------


//@desc       forgot  Password
//@route      POST /api/v1/auth/forgotPassword 
//@access     public 
exports.forgotpassword = asyncHandler(async (req, res, next) => {
    // 1) Get user by email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
        return next(new ApiError(`There is no user with that email: ${req.body.email}`, 404));
    }

    // 2) If user exists, generate hash reset random 6 digits and save it in db
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedResetCode = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex')

    // save hashed code in DB
    user.passwordResetCode = hashedResetCode;
    // Add expireation time for password reset code in (10 min)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();

    // 3) send the reset code via email
    const message = `Hi ${user.name}, \n We received a request to reset your password on your E-Shop App Account. \n code: ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure. \n eng.Hassan Essam `

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password reset code (valid for 10min)',
            message: message,
        })
    } catch (err) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;
        await user.save();

        return next(new ApiError('There is an error in sending email', 500))
    }

    res.status(200).json({ status: "success", message: "Reset code sent to email.." })
});



//@desc       Verify Reset code
//@route      POST /api/v1/auth/verifyResetCode
//@access     public 
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
    // 1) Get User based on reset code 
    if (!req.body.resetCode) {
        return next(new ApiError('Please enter reset code...', 400));
    }
    const hashedResetCode = crypto
        .createHash('sha256')
        .update(req.body.resetCode)
        .digest('hex')

    const user = await UserModel.findOne({
        passwordResetCode: hashedResetCode,
        passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ApiError('Reset code invalid or expired', 404));
    }

    // 2) Reset code is valid
    user.passwordResetVerified = true;
    await user.save();

    res.status(200).json({ status: "success", message: "Reset code is Valid" })
});



//@desc       Reset password
//@route      POST /api/v1/auth/resetPassword
//@access     public 
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // 1) Get User based on email
    if (!req.body.email || !req.body.newPassword) {
        return next(new ApiError('Please enter your email...', 400));
    }

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new ApiError('This is no user with this email..!', 404));
    }

    // 2) check if reset code verified 
    if (!user.passwordResetVerified) {
        return next(new ApiError('Reset code not verified..', 400))
    }

    // update password
    user.password = req.body.newPassword;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();

    // 3) if everything is ok, generate a new token
    const token = generateToken({ userId: user._id });

    res.status(200).json({ status: 'success', token });
});



// ------------------  Ative Account   ------------------


//@desc       Request to Active user Account
//@route      POST /api/v1/users/activateMe 
//@access     public 
exports.activateUserAccount = asyncHandler(async (req, res, next) => {
    // 1) Get user by email
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
        return next(new ApiError(`There is no user with that email: ${req.body.email}`, 404));
    }

    // 2) If user exists, generate hash reset random 6 digits and save it in db
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedResetCode = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex')

    // save hashed code in DB
    user.activeResetCode = hashedResetCode;
    // Add expireation time for password reset code in (10 min)
    user.activeResetExpires = Date.now() + 10 * 60 * 1000;
    user.activeResetVerified = false;

    await user.save();

    // 3) send the reset code via email
    const message = `Hi ${user.name}, \n We received a request to activate your account in E-Shop App. \n code: ${resetCode} \n Enter this code to complete the activate. \n Thanks for helping us keep your account secure. \n eng.Hassan Essam `

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Activation code (valid for 10min)',
            message: message,
        })
    } catch (err) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;
        await user.save();

        return next(new ApiError('There is an error in sending email', 500))
    }

    res.status(200).json({ status: "success", message: "Activation code sent to email.." })
});


//@desc       Verify Reset code
//@route      POST /api/v1/auth/verifyResetCode
//@access     public 
exports.verifyActivationCode = asyncHandler(async (req, res, next) => {
    // 1) Get User based on reset code 
    if (!req.body.activationCode) {
        return next(new ApiError('Please enter you activation code...', 400));
    }
    const hashedActiveCode = crypto
        .createHash('sha256')
        .update(req.body.activationCode)
        .digest('hex')

    const user = await UserModel.findOne({
        activeResetCode: hashedActiveCode,
        activeResetExpires: { $gt: Date.now() }
    })

    if (!user) {
        return next(new ApiError('Activation code invalid or expired', 404));
    }

    // 2) Reset code is valid
    user.activeResetVerified = true;
    await user.save();

    res.status(200).json({ status: "success", message: "Activation code is Valid" })
});


//@desc       Make User Account Active
//@route      POST /api/v1/auth/reactivateUserAccount
//@access     public 
exports.reactivateUserAccount = asyncHandler(async (req, res, next) => {
    // 1) Get User based on email
    if (!req.body.email) {
        return next(new ApiError('Please enter your email...', 400));
    }

    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
        return next(new ApiError('This is no user with this email..!', 404));
    }

    // 2) check if reset code verified 
    if (!user.activeResetVerified) {
        return next(new ApiError('Activation code not verified..', 400))
    }

    // update password
    user.active = true;
    user.activeResetCode = undefined;
    user.activeResetExpires = undefined;
    user.activeResetVerified = undefined;

    await user.save();

    // 3) if everything is ok, generate a new token
    const token = generateToken({ userId: user._id });

    res.status(200).json({ status: 'success', token });
});
