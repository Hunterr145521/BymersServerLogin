const express= require('express');
const { read, update }  =  require('../Controller/userController');
const router = express.Router();
const { requireSignIn, adminMiddleware }  = require('../Controller/authController');
// const { userSignupValidator, userSigninValidator } = require('../validators/auth')
// const { runValidation } = require('../validators')

// get authenicated user data
router.get('/user/:id',requireSignIn, read);
// forgot password

// update user

//adding adminMiddleware can give the access to only admins
router.put('/user/update',requireSignIn, update);

router.put('/admin/update',requireSignIn,adminMiddleware, update);


module.exports = router