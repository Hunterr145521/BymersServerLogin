const User  = require('../Models/user');


exports.read = (req,res) => {
    const userId = req.params.id;
    console.log("User Id " , userId);


    User.findById(userId).exec((err,user) => {
        if(err || !user) {
            return res.status(400).json({
                error: "User Not Found"
            });
        }
        user.hashed_password = undefined
        user.salt = undefined
        res.json(user);
    })
} 



exports.update = (req,res) => {
    // console.log("Updated User  = " , req.user, "\n Updated Data ", req.body );
    const { name, password } = req.body;

    User.findOne({_id : req.user._id}, (err,user) => {
        if(err || !user){
            return res.status(400).json({
                error: 'User Not Found'
            })
        }
        if(!name){
            return res.status(400).json({
                error: 'Name is Required'
            })
        }else{
            user.name = name
        }

        if(password){
            if (password.length  < 6){
                return res.status(400).json({
                    error: 'Length must be 6 charecters long'
                })
            }
            else{
                user.password = password
            }
        }


        user.save((err,updatedUser) => {
            if(err){
                console.log("User Updated Failed");
                return res.status(400).json({
                    error: 'User Update Failed'
                })
            }
            updatedUser.hashed_password = undefined
            updatedUser.salt = undefined
            res.json(updatedUser);
        })

    });



}