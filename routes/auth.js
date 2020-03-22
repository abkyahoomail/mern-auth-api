const express = require('express');
const { signup, signin, activate } = require('../controllers/auth');

const { signupValidator, signinValidator } = require('../validators/auth');
const { runValidations } = require('../validators/index');

const router = express.Router();

router.post('/signup', signupValidator, runValidations, signup)
router.post('/signin', signinValidator, runValidations, signin)

router.post('/activate', activate)

module.exports = router;
