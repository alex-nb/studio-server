const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return res
            .status(401)
            .json({ errors: [{ msg: 'Not authenticated.' }] });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'supersuperverysecretlongstring');
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
    if (!decodedToken) {
        return res
            .status(401)
            .json({ errors: [{ msg: 'Not authenticated.' }] });
    }
    req.userId = decodedToken.userId;
    next();
};