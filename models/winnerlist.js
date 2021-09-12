const mongoose =require('mongoose')



const TambolaSchema= new mongoose.Schema({
    date:{
        type:Date,
        default:Date.now()
    },
    winnerlist:[]
})

const model=mongoose.model('winnerlist',TambolaSchema)


module.exports=model