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

exports.updateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be atleast 6 chars long')
]

exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Email must be valid')
]

exports.resetPasswordValidator = [
    check('newpassword')
        .not()
        .isEmpty()
        .isLength({ min: 6 })
        .withMessage('Password must be atleast 6 chars long')
]