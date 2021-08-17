const mongoose =require('mongoose')


const TambolaSchema= new mongoose.Schema({
    id:Number,
    username:{
        type:String,
    }, 
    ticket:[[]],
    gpay:Number,
    userId:String
})



module.exports=TambolaSchema