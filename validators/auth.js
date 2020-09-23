const { check } = require('express-validator')


exports.userSignupValidator =  [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required!'),
    check('email')
        .isEmail()
        .withMessage('Email is required! and Valid one'),
    check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters Long')
];



exports.userSigninValidator =  [
    check('email')
        .isEmail()
        .withMessage('Email is required! and Valid one'),
    check('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters Long')
];


exports.forgotPasswordValidator =  [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Email is required! and Valid one')
];


exports.resetPasswordValidator =  [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters Long')
];