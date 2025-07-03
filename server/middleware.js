// FILE: server/middleware.js
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./config');

const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];

  if (!token) {
    return res.status(403).send({ message: 'No token provided!' });
  }

  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Unauthorized!' });
    }
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  });
};

const isAdmin = (req, res, next) => {
    if (req.userRole === 'admin') {
        return next();
    }
    return res.status(403).send({ message: "Require Admin Role!" });
};

module.exports = { verifyToken, isAdmin };