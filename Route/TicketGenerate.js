const tambola=require('tambola');
const route=require('express').Router();
const cors =require('cors')


route.get('/',cors(),(req,res)=>{

    const TicketGenerator=()=>{
        let ticket = tambola.generateTicket();
         return ticket
       }
       res.json(TicketGenerator())
})



module.exports= route