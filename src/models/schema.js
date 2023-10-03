require('dotenv').config();
const mongoose= require("mongoose");
const jwt=require("jsonwebtoken")


const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
        type:String,
        required:true
        }
    }]
})

userSchema.methods.generateAuthToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token})
        await this.save();
        return token;
    } catch (error) {
        console.log(error)
    }
}

const Register =new mongoose.model("RegisteredUser",userSchema)

module.exports=Register;
