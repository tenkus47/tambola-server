const mongoose =require('mongoose')



const TambolaSchema= new mongoose.Schema({
    date:{
        type:Date,
        default:Date.now()
    },
    quickfiveWinner:[],
    fourcornerWinner:[],
    temperatureWinner:[],
    firstlineWinner:[],
    secondlineWinner:[],
    thirdlineWinner:[],
    fullhouseWinner:[],
    secondfullhouseWinner:[],
    thirdfullhouseWinner:[]
})

const model=mongoose.model('winnerlist',TambolaSchema)


module.exports=model