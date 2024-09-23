const express = require('express');
const router = express.Router();
const { signup, login, adminLogin, forgotPasswordController } = require('../controllers/authController');
const { loginMiddleware, adminProtect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/admin-auth', adminProtect,(req,res) => {res.status(200).send({ok:true})});
router.post('/forgot-password', forgotPasswordController)
router.get('/user-auth',loginMiddleware, (req,res) => {
    res.status(200).send({ok:true}); 
})
module.exports = router;
