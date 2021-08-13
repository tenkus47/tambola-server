const mongoose =require('mongoose')



const TambolaSchema= new mongoose.Schema({
   collectionid:{
  type:Number,
  require:true
   },
    random:{
        type:Number,
        require:true
    },
    list:{
        type:[],
        require:true
    },
    date:{
        type:Date,
        default:Date.now()
    }
})

const model=mongoose.model('boardlist',TambolaSchema)


module.exports=model