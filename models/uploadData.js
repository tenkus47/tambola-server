const mongoose =require('mongoose')


const TambolaSchema= new mongoose.Schema({
    id:Number,
    ticket:[[]],
    username:{
        type:String,
        default:'Available'
    },
    color:String
})



module.exports=TambolaSchema