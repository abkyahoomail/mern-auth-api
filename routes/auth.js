const express = require('express');
const { runValidations } = require('../validators/index');

const {
    signup,
    signin,
    activate,
    forgotPassword,
    resetPassword,
    googleLogin
} = require('../controllers/auth');

const {
    signupValidator,
    signinValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators/auth');


const router = express.Router();

router.post(
    '/signup',
    signupValidator,
    runValidations,
    signup
)
router.post(
    '/signin',
    signinValidator,
    runValidations,
    signin
)
router.post('/activate', activate)

router.put(
    '/forgot-password',
    forgotPasswordValidator,
    runValidations,
    forgotPassword
)

router.put(
    '/reset-password',
    resetPasswordValidator,
    runValidations,
    resetPassword
)

router.post(
    '/google-login',
    googleLogin
)

module.exports = router;
