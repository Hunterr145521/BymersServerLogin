const User = require('../Models/user')

const jwt = require('jsonwebtoken')

const expressJwt = require('express-jwt');

const _ = require('lodash');


const fetch = require('node-fetch');

// send grid

const sgMail = require('@sendgrid/mail')


const {OAuth2Client} = require('google-auth-library');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


//simple signup without any authentication method

// exports.signUp = (req,res) => {
    
//     // console.log("REQ BODY ON SIGNUP : ", req.body);
//     // res.json({
//     //     data: "Sign Up Endpoint 0_0"
//     // });
//     const {name,email,password} = req.body;

//     User.findOne({email}).exec((err,user) => {
//         if (user){
//             return res.status(400).json({
//                 error: "The Email id has been taken"
//             })
//         }
//     })
//     let newUser = new User({name,email,password})

//     newUser.save((err,success) => {
//         if(err){
//          console.log("SIGNUP ERROR ", err);
//          return res.status(400).json({error:err
//         }); 
//         }
//         res.json({
//             message: "Sign Up Successfully!"
//         })

//     })

// };


//signup method with authentication



exports.signUp = (req,res) => {
    //fetching user Data! from database according to the req
    const {name,email,password } = req.body;
    User.findOne({email}).exec((err,user) => {
        if (user){
            return res.status(400).json({
                error: "The Email id has been taken"
            })
        }


        const token = jwt.sign({name, email, password}, process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn: '10m'});

        
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account Activation Link`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <link href="https://fonts.googleapis.com/css2?family=Grandstander:wght@500&display=swap" rel="stylesheet"> 
                <style>
                    body {
                        background-color: #abe9cd;
                        background-image: linear-gradient(315deg, #abe9cd 0%, #3eadcf 74%);
                    }
            
                    .card{
                        flex: 1;
                        align-content: center;
                        align-items: center;
                        text-align: center;
                    }
            
                    .WelcomeFont, p{
                        font-family: 'Grandstander', cursive;
                    }
            
            
            
                </style>
            </head>
            <body>
                <div class="card">    
                    <h1 class="WelcomeFont">Welcome ${name}</h1>
                    <p>Please use the following link to activate your account</p>
                    <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                    <hr />
                    <p>This Email Contain Sensetive Information.</p>
                    <p>${process.env.CLIENT_URL}</p>
                </div>
            
            </body>
            </html>
            `
        }

        sgMail.send(emailData).then(sent => {
            console.log("Sign up email Sent", sent);
            return res.json({
                message: `Email has been sent to ${email}. Follow the instruction to activate your account.`
            })
        }).catch(err => {
            console.log(err);
            return res.json({
                message: `Error : ${err.message}`
            })
        })
    
    
    });


}


// account acctivation after sending the link


exports.accountActivation = (req,res) => {
    const { token } = req.body;

    console.log(token);

    if(token){
        jwt.verify(token,process.env.JWT_ACCOUNT_ACTIVATION, (err,decoded) => {
            if(err){
                console.log("Activation Error ", err);
                return res.status(401).json({
                    error: 'Expired link. Sign Up Again'
                })
            }

            const {name, email, password} = jwt.decode(token)

            const user =new User({name,email,password})

            user.save((err,user) => {
                if(err){
                    console.log('save user in account activation error',err);
                    return res.status(401).json({
                        error: 'Error Saving User in db. Try SignUp Again'
                    });
                }
                return res.json({
                    message: 'Sign Up Success. Please Sign In'
                })
            })

        })

    } else {
        return res.json({
            message: 'Something went wrong. Try Again'
        })   
    }
}



//sign in method 

exports.signin = (req,res) => {
    console.log(req.body);
    const {email,password} = req.body;
    User.findOne({email})
    .exec((err,user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User with that email doesnot exist'
            })
        }
        // Match pass now
        if(!user.authenticate(password)){
            return res.status(400).json({
                error: 'Email and Password do not match or exist'
            })
        }
        //generate a token
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        const {_id, name,email,role} = user;

        return res.json({
            token,
            user: {_id, name,email,role}
        });


    })

}



// sign in authentication check wether he is logged in or not

exports.requireSignIn = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
});



// same for admin section


exports.adminMiddleware = (req,res,next) => {
    User.findById({_id: req.user._id}).exec((err,user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User Not Found!'
            })
        }
        if(user.role !== 'admin'){
            return res.status(400).json({
                error: 'Admin Resource!'
            })
        }
        req.profile = user;
        next();
    })
}


// forgot password

exports.forgotPassword = (req,res) => {
    const { email } = req.body;


    User.findOne({email}, (err,user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User with that email does not exist'
            });
        }

        const token = jwt.sign({_id : user._id, name: user.name}, process.env.JWT_RESET_PASSWORD, {expiresIn: '10m'});

        
        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password Reset Link`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
                <link href="https://fonts.googleapis.com/css2?family=Grandstander:wght@500&display=swap" rel="stylesheet"> 
                <style>
                    body {
                        background-color: #abe9cd;
                        background-image: linear-gradient(315deg, #abe9cd 0%, #3eadcf 74%);
                    }
            
                    .card{
                        flex: 1;
                        align-content: center;
                        align-items: center;
                        text-align: center;
                    }
            
                    .WelcomeFont, p{
                        font-family: 'Grandstander', cursive;
                    }
            
            
            
                </style>
            </head>
            <body>
                <div class="card">    
                    <h1 class="WelcomeFont">Please use this link to reset your password</h1>
                    
                    <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    <hr />
                    <p>This Email Contain Sensetive Information.</p>
                    <p>${process.env.CLIENT_URL}</p>
                </div>
            
            </body>
            </html>
            `
        };


        return user.updateOne({resetPasswordLink: token}, (err,success) => {
            if(err){
                console.log("Reset Password Line Error",err)
                return res.status(400).json({
                    error: "Database connection error on user password forgot request"
                });
            }else{
                sgMail.send(emailData).then(sent => {
                    console.log("Sign up email Sent", sent);
                    return res.json({
                    message: `Email has been sent to ${email}. Follow the instruction to update your password.`
                    })
                }).catch(err => {
                    console.log(err);
                    return res.json({
                        message: `Error : ${err.message}`
                    })
                })
            }
        })


        
    })
}



// reset password

exports.resetPassword = (req,res) => {
    console.log(req.body);
    const { resetPasswordLink, newPassword } = req.body;  
    
    if(resetPasswordLink){
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err,decoded){
            if(err){
                return res.status(400).json({
                    error: 'Token Expired, Try Again.'
                });
            }


            User.findOne({resetPasswordLink}, (err,user) => {
                if(err || !user){
                    return res.status(400).json({
                        error: 'Something Went wrong. Try Again Later!'
                    })
                }

                const updatedFeilds = {
                    password: newPassword,
                    resetPasswordLink : ''
                }

                user = _.extend(user, updatedFeilds)


                user.save((err,result) => {
                    if(err){
                        return res.status(400).json({
                            error: 'Error Occured while updating data, Try Again Later.'
                        })
                    }
                    res.json({
                        message: 'Password Updated!'
                    })
                })
            })
        })
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = (req,res) => {
    console.log(req.body);
    const {idToken}  = req.body;
    
    client.verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT_ID})
    .then(response => {
        console.log("GOOGLE LOGIN RESPONSE ", response);
        const {email_verified, name, email} = response.payload
        if(email_verified){
            User.findOne({email}).exec((err,user) => {
                if(user){
                    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
                    const {_id,email,name,role} = user
                    return res.json({
                        token,
                        user: {_id,email,name,role}
                    });
                }else{
                    let password = email + process.env.JWT_SECRET
                    user = new User({name,email, password})
                    user.save((err,data) => {
                        if(err){
                            console.log("ERROR GOOGLE LOGIN ON USER SAVE", err)
                            return res.status(400).json({
                                error: 'USER SIGNIN FILED WITH GOOGLE'
                            })
                        }
                        const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
                        const {_id,email,name,role} = data
                        return res.json({
                            token,
                            user: {_id,email,name,role}
                        });
                    });
                }
            })
        }else{
            return res.status(400).json({
                error: 'Google Login Failed, Try Again'
            })   
        }



    })

}


exports.facebookLogin = (req,res) => {
    console.log(req.body);

    const { userID, accessToken } = req.body;

    const url = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;


    return (
        fetch(url, {
            method: 'GET',
        })
        .then(res => res.json())
        .then(resp => {
            const {email,name} = resp

            User.findOne({email}).exec((err,user) => {
                if(user){
                    const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
                    const {_id,email,name,role} = user

                    console.log("Details ", _id,email,name,role);
                    return res.json({
                        token,
                        user: {_id,email,name,role}
                    });
                }else{
                    let password = email + process.env.JWT_SECRET
                    user = new User({name,email, password})
                    user.save((err,data) => {
                        if(err){
                            console.log("ERROR FACEBOOK LOGIN ON USER SAVE", err)
                            return res.status(400).json({
                                error: 'USER SIGNIN FILED WITH FACEBOOK'
                            })
                        }
                        const token = jwt.sign({_id: data._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
                        const {_id,email,name,role} = data
                        return res.json({
                            token,
                            user: {_id,email,name,role}
                        });
                    });
                }
            })
        })
        .catch(err => {
            console.log(err);
            res.json({
                error: 'FACEBOOK LOGIN FAILED. TRY LATER'
            })
        })
    )

}