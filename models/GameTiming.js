const mongoose =require('mongoose')



const TimingSchema= new mongoose.Schema({
    startTime:Date,
})

const model=mongoose.model('Timing',TimingSchema)


module.exports=model

