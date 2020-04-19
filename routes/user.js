const express = require('express');
const { userinfo, updateuser } = require('../controllers/user');
const { validatesignin, validateadmin } = require('../controllers/auth');
const router = express.Router();
const { updateValidator } = require('../validators/auth');
const { runValidations } = require('../validators/index');

router.get(
    '/user/:id',
    validatesignin,
    userinfo
)
router.put(
    '/user/update',
    validatesignin,
    updateValidator,
    runValidations,
    updateuser
)
router.put(
    '/admin/update',
    validatesignin,
    validateadmin,
    updateValidator,
    runValidations,
    updateuser
)

module.exports = router;