const { validationResult } = require('express-validator');

const validatorMiddleware = (req, res, next) => {
    // Find the validation errors in the request 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // No validation errors, call the next middleware or handler
    next();
}

module.exports = validatorMiddleware;