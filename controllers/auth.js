const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const expressJWT = require('express-jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const verifyAsync = function (token, SECRET) {
    return new Promise(function (resolve, reject) {
        jwt.verify(
            token,
            SECRET,
            function (err, decoded) {
                if (err) {
                    reject(err)
                    return;
                }
                resolve(decoded)
            }
        )
    })
}

exports.validatesignin = expressJWT({
    secret: process.env.JWT_SECRET
})

exports.signup = async function (req, res) {
    const { name, email, password } = req.body;
    try {
        const emailExists = await User.findOne({ email })
        if (emailExists) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'The email address you have entered is already associated with another account.'
                        }
                    ]
                })
        }

        const token = jwt.sign(
            {
                name,
                email,
                password
            },
            process.env.ACCOUNT_CONFIRMATION_KEY,
            {
                expiresIn: '10m'
            }
        )

        const message = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account activation link`,
            html: `
                <h3>Click on the below link to activate your account</h3>
                <br/>
                <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                <br/>
                <hr/>
            `
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        await sgMail.send(message)
        return res.status(200)
            .send({
                msg: `email was sent to mail: ${email}`
            })
    } catch (err) {
        return res.status(400)
            .send({
                errors: [
                    {
                        'msg': err.message
                    }
                ]
            })
    }
}

exports.activate = async function (req, res) {
    const { token } = req.body;
    if (token) {
        try {
            const decoded = await verifyAsync(
                token,
                process.env.ACCOUNT_CONFIRMATION_KEY
            );
            const { name, email, password } = decoded;
            const newUser = new User({ name, email, password })
            await newUser.save()
            return res.status(200)
                .send({
                    msg: 'New user signUp is successful. Please signIn',
                    createdEntity: newUser
                })

        } catch (err) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            msg: 'Invalid link.Sign up again and retry'
                        }
                    ]
                })
        }
    } else {
        return res.status(400)
            .send({
                errors: [
                    {
                        msg: 'Something went wrong.Sign up again and retry'
                    }
                ]
            })
    }
}

exports.signin = async function (req, res) {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'User with this email does not exist. Please signup.'
                        }
                    ]
                })
        }
        if (!user.authenticate(password)) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'Invalid credentials. Try again'
                        }
                    ]
                })
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        return res.status(200)
            .send({
                token,
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    id: user._id
                }
            })
    } catch (err) {
        return res.status(400)
            .send({
                errors: [
                    {
                        'msg': err.message
                    }
                ]
            })
    }
}

exports.validateadmin = async function (req, res, next) {
    try {
        const userId = req.user.id;
        const user = User.findById(userId);
        if (!user) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'User not found'
                        }
                    ]
                })
        }
        if (user.role !== "admin") {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'Admin resource. Access denied'
                        }
                    ]
                })
        }

        req.profile = user;
        next()
    } catch (err) {
        return res.status(400)
            .send({
                errors: [
                    {
                        'msg': err.message
                    }
                ]
            })
    }
}

exports.forgotPassword = async function (req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'User with this email does not exist'
                        }
                    ]
                })
        }
        const token = jwt.sign(
            {
                id: user._id
            },
            process.env.RESET_PASSWORD_KEY,
            {
                expiresIn: '10m'
            }
        )

        await user.updateOne({ verificationToken: token })

        const message = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password reset link`,
            html: `
                <h3>Click on the below link to reset your password</h3>
                <br/>
                <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                <br/>
                <hr/>
            `
        }
        sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        await sgMail.send(message)
        return res.status(200)
            .send({
                msg: `email was sent to mail: ${email}`
            })
    } catch (err) {
        return res.status(400)
            .send({
                errors: [
                    {
                        'msg': err.message
                    }
                ]
            })
    }
}

exports.resetPassword = async function (req, res) {
    try {
        const { resetToken, newpassword } = req.body;
        if (!resetToken) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'Something is not right. Please try again'
                        }
                    ]
                })
        }
        const decoded = await verifyAsync(
            resetToken,
            process.env.RESET_PASSWORD_KEY
        );
        const { id: userId } = decoded;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400)
                .send({
                    errors: [
                        {
                            'msg': 'User not found'
                        }
                    ]
                })
        }
        user.password = newpassword;
        user.verificationToken = '';
        await user.save();
        return res.status(200)
            .send({
                msg: `Password was reset successfully`
            })
    } catch (err) {
        return res.status(400)
            .send({
                errors: [
                    {
                        'msg': err.message
                    }
                ]
            })
    }
}

exports.googleLogin = async function (req, res) {
    const { googleTokenId } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: googleTokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        })
        const payload = ticket.getPayload();
        const { email_verified, name, email } = payload;
        if (email_verified) {
            let user = await User.findOne({ email })
            if (user) {
                const token = jwt.sign(
                    { id: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '7d' }
                )

                return res.status(200)
                    .send({
                        token,
                        user: {
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            id: user._id
                        }
                    })
            }
            let password = email + process.env.JWT_SECRET;
            user = new User({
                name,
                email, 
                password
            })
            const newUser = await user.save();
            const token = jwt.sign(
                { id: newUser._id },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            )
            return res.status(200)
                    .send({
                        token,
                        user: {
                            name: newUser.name,
                            email: newUser.email,
                            role: newUser.role,
                            id: newUser._id
                        }
                    })
        }
    } catch (err) {
        return res.status(400)
            .send({
                errors: [
                    {
                        'msg': err.message
                    }
                ]
            })
    }
}