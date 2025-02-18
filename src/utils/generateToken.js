const jwt = require("jsonwebtoken");

const genToken = (user) => {
    return jwt.sign({
        id: user._id,
        name: user.name,
        email: user.email,
    }, 
        process.env.JWT_SECRET, {
        expiresIn: '1d'
    })
}

module.exports = genToken