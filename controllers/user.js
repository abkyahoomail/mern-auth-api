const User = require('../models/user');

exports.userinfo = async function (req, res) {
    try {
        const userId = req.params.id;
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
        user.hashedPassword = undefined;
        user.salt = undefined;
        return res.status(200).send(user)
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

exports.updateuser = async function (req, res) {
    try {
        const { name, password } = req.body;
        const userId = req.user.id;
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
        user.name = name;
        user.password = password;
        await user.save();
        user.hashedPassword = undefined;
        user.salt = undefined;
        return res.status(200).send(user)
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