const jwt=require("jsonwebtoken")
const Register=require("../models/schema")
const async = require("hbs/lib/async")


const auth=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        const verify=jwt.verify(token,process.env.SECRET_KEY);
        next();

    } catch (error) {
        res.status(401).send("PLEASE LOG IN")
    }
}

module.exports=auth
