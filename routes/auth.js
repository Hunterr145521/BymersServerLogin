const express= require('express');
const { signUp,accountActivation, signin, forgotPassword, resetPassword,googleLogin, facebookLogin }  =  require('../Controller/authController');
const router = express.Router();
const { userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/auth')
const { runValidation } = require('../validators')

// Sign Up
router.post("/signup",userSignupValidator,runValidation, signUp);
// Account Activation
router.post("/account-activation", accountActivation);
// Sign In
router.post('/signin',userSigninValidator,runValidation, signin);
// forgot password
router.put('/forgot-password',forgotPasswordValidator,runValidation,forgotPassword);
router.put('/reset-password',resetPasswordValidator,runValidation,resetPassword);
// google and facebook endpoint
router.post('/google-login',googleLogin);
router.post('/facebook-login',facebookLogin);


module.exports = router