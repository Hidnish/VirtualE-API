import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token) return res.status(403).json({ message: 'No token provided' });
  jwt.verify(token, config.SECRET);
  next();
};

// TEST function to verify token
const verifyTokenTest = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // because we only want the token portion of the authHeader = "Bearer <token>"
  if (token == null)
    return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(401).json({ message: 'Token not authorized' });
    req.user = user;
    next();
  });
};

export { verifyToken, verifyTokenTest };
