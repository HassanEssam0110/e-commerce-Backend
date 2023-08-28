const express = require('express');
const { getReview, getReviews, createReview, updateReview, deleteReview, createFilterObj, setProductIdToAndUserIdBody } = require('../controllers/reviewController');
const { createReviewValidator, updateReviewValidator, getBReviewValidator, deleteReviewValidator } = require('../utils/validators/reviewValidators')
const authService = require('../services/authService');

// to allow chiled route access to params from parent route
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(createFilterObj, getReviews)
    .post(authService.protect, authService.allowedTo('user'), setProductIdToAndUserIdBody, createReviewValidator, createReview)

router.route('/:id')
    .get(getBReviewValidator, getReview)
    .put(authService.protect, authService.allowedTo('user'), updateReviewValidator, updateReview)
    .delete(authService.protect, authService.allowedTo('user', 'admin', 'manager'), deleteReviewValidator, deleteReview)


module.exports = router;