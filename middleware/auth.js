const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/admin');

// exports.protect = async (req, res, next) => {
//   console.log("user token =>",req.headers);
  
//   let token;
//   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1];

//   }
//   console.log("token=====>",token)

//   if (!token) {
//     return res.status(401).json({ error: 'Not authorized' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id);
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Not authorized' });
//   }
// };

exports.adminProtect = async (req, res, next) => {
  // console.log("header token =>",req.headers);
  
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization;
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = await Admin.findById(decoded.id);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized' });
  }
};



exports.loginMiddleware = (req, res, next) => {

  console.log("login minddle ware===>",req.header)
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token if it's in the format 'Bearer token'

  if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
  } catch (error) {
      console.error('JWT Error:', error);
      return res.status(401).json({ message: 'Token is not valid' });
  }
};

exports.protect = async (req, res, next) => {
  // console.log("user token =>", req.headers);
  
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]; // Extract token
  }
  
  // console.log("token=====>", token);

  if (!token) {
      return res.status(401).json({ error: 'Not authorized' });
  }

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      next();
  } catch (err) {
      return res.status(401).json({ error: 'Not authorized' });
  }
};
