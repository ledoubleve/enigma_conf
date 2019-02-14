const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const jwtKey = process.env.JWT_KEY || 'secret';
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, jwtKey, null);
        req.userData = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            message: 'Unauthorized'
        })
    }
}