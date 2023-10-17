const jwt=require("jsonwebtoken")
const Register=require("../models/schema")
const async = require("hbs/lib/async")


const auth=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        const verify=jwt.verify(token,process.env.SECRET_KEY);
        next();

    } catch (error) {
        res.redirect("/login?LoginError=Please Log in To continue")
    }
}

module.exports=auth
