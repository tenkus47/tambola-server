const mongoose =require('mongoose')



const PrivateSchema= new mongoose.Schema({
  
    key:String
})

const model=mongoose.model('privatekey',PrivateSchema)


module.exports=model

