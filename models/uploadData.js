const mongoose =require('mongoose')



const TambolaSchema= new mongoose.Schema({
    id:Number,
    username:{
        type:String,
    }, 
    ticket:[[]],
    gpay:Number,
})

const model=mongoose.model('Tambola',TambolaSchema)


module.exports=model