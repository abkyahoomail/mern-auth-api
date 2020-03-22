const mongoose = require('mongoose')
const crypto = require('crypto');

// user schema

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            trim: true,
            max: 32,
            required: true
        },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            lowercase: true
        },
        hashedPassword: {
            type: String,
            required: true
        },
        salt: String,
        role: {
            type: String,
            default: "subscriber"
        },
        verificationToken: {
            data: String,
            default: ''
        },
    },
    {
        timestamps: true
    }
)

// virtual

userSchema
    .virtual('password')
    .set(function (password) {
        this._password = password
        this.salt = this.makeSalt()
        this.hashedPassword = this.encryptPassword(password)
    })
    .get(function () {
        return this._password;
    })

// methods

userSchema.methods = {
    makeSalt() {
        return Math.round(new Date().valueOf() * Math.random()) + ''
    },
    encryptPassword(password) {
        if (!password) return ''
        try {
            const hash = crypto.createHmac('sha1', this.salt)
                .update(password)
                .digest('hex')

            return hash;
        } catch (err) {
            return ''
        }
    },
    authenticate(plainText) {
        return this.encryptPassword(plainText) === this.hashedPassword
    }
}

module.exports = mongoose.model('User', userSchema)