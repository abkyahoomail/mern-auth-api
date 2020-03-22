const User = require('../models/user');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail')

const verifyAsync = function (token) {
    return new Promise(function (resolve, reject) {
        jwt.verify(
            token,
            process.env.ACCOUNT_CONFIRMATION_KEY,
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
            const decoded = await verifyAsync(token);
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
                    role: user.role
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