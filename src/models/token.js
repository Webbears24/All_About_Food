const mongoose=require("mongoose")
const Schema=mongoose.Schema

const tokenSchema=new Schema({
    userid:{
        type:Schema.Types.ObjectId,
        require:true,
        ref:"RegisteredUser",
        unique:true,
    },
    token:{
        type:String,
        require:true
    },
    createdAt:{type:Date,default:Date.now(),expires:600}
})

module.exports=mongoose.model('token',tokenSchema)