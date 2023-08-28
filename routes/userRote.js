const express = require('express');
const { getUsers, getUser, updateUser, deleteUser, createUser, resizeImage, uploadUserImage, changeUserPassword, getLoggedUserData, changeLoggedUserPassword, updateLoggedUser, deactivateLoggedUser } = require('../controllers/userController');
const { createUserValidator, deleteUserValidator, getUserValidator, updateUserValidator, updateUserPasswordValidator, updateLoggedUserPasswordValidator, updateLoggedUserValidator } = require('../utils/validators/userValidators')
const authService = require('../services/authService');

const router = express.Router();


// can't access without token
router.use(authService.protect)

// Logged user access
router.get('/getMe', getLoggedUserData, getUser)
router.put('/changeMyPassword', updateLoggedUserPasswordValidator, changeLoggedUserPassword)
router.put('/updateMe', uploadUserImage, resizeImage, updateLoggedUserValidator, updateLoggedUser)
router.put('/deactivateMe', deactivateLoggedUser)




//  Admin access
router.use(authService.allowedTo('admin'))

router.put('/changePassword/:id', updateUserPasswordValidator, changeUserPassword)

router.route('/')
    .get(authService.protect, getUsers)
    .post(uploadUserImage, resizeImage, createUserValidator, createUser)

router.route('/:id')
    .get(getUserValidator, getUser)
    .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
    .delete(deleteUserValidator, deleteUser)


module.exports = router;