const express = require('express');
const userRouter = express.Router();
const zod = require('zod');
const { User } = require('../models/userModel');
const { SECRET_KEY } = require('../config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const signupBody = zod.object({
    name:zod.string(),
    userName:zod.string(),
    email:zod.string().email(),
    password:zod.string()
})

const signinBody = zod.object({
    email:zod.string().email(),
    password:zod.string()
})

const postSignup = async(req,res) => {
    try{
        const {success} = await signupBody.safeParse(req.body);
        if(!success){
            res.json({
                message:"Credential filling by you are incorrect!"
            })
            return
        }
        const {name, userName, email, password} = req.body;
        const existingUser = await User.findOne({email, userName});
        if(existingUser){
            res.json({
                message:"User with this credential are already exist!"
            })
            return
        }
        // console.log(2);

        // Hashing the password using bcrypt
        const hashPassword = await bcrypt.hashSync(password, 10);

        const user = await User.create({
            name, 
            userName,
            email,
            password:hashPassword
        })

        const userId = user._id;
        const token = jwt.sign({userId, name, userName, email}, SECRET_KEY );

        res.json({
            message:"You are logged in Successfuly",
            token:token,
            _id:user._id,
            success:true
        })
        return

    }catch(error){
        res.json({
            message:error.message,
            success:true
        })
        return
    }
}

const postSignin = async (req, res)=>{
    try{
        const {success} = signinBody.safeParse(req.body);
        if(!success){
            res.json({
                message:"Credential are wrong!"
            })
            return
        }
    
        const user = await User.findOne({email:req.body.email});
    
        if(!user){
            res.json({
                message:"User with this email does not exist!"
            })
            return
        }
        console.log(user)
        const checkPassword = await bcrypt.compareSync(req.body.password,user.password);

        // console.log('vin1')
        if(!checkPassword){
            res.json({
                message:"Your password is wrong!"
            })
            return
        }
        // console.log('vin1')

        const userId = user._id;
        const token = await jwt.sign({userId}, SECRET_KEY );

        res.json({
            message:"User is login",
            token:token,
            userId,
            success:true
        })
        
    }catch(error){
        res.json({
            message:error.message,
            success:false
        })
    }
}

const checkUser = async (req, res)=>{
    try{
        const token = req.headers.authorization.split(' ')[1];
        // console.log(token)
        const decodedToken = jwt.verify(token ,  SECRET_KEY);
        const userId = decodedToken.userId;
    
        const userData = await User.find({_id:userId});
    
        res.json({
            userData,
            message:"User exist",
            success:true
        })
    }catch(error){
        res.json({
            message:error.message,
            success:false
        })
    }

}

userRouter
    .route('/signup')
    .post(postSignup)
userRouter
    .route('/signin')
    .post(postSignin)

userRouter
    .route('/checkUser')
    .get(checkUser)
   
module.exports={
    userRouter
}    
