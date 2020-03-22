const { check } = require('express-validator')

exports.signupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Email must be valid'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 5 chars long')
]

exports.signinValidator = [
    check('email')
        .isEmail()
        .withMessage('Invalid signin credentials'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Invalid signin credentials')
]