const express = require("express");
const { PORT} = require("./config");
const app = express();
const http=require('http')
var bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const {MongooseAutoIncrementID} =require('mongoose-auto-increment-reworked');
const TambolaSchema= require("./models/uploadData");
const PrivateKey=require("./models/Password");
const ListModel = require("./models/ticketList");
const WinnerModel=require('./models/winnerlist');
const TimingModel=require('./models/GameTiming');
var tambola = require("tambola");

var finalnewlist=[]
const server=http.createServer(app)

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});



var timeout = null;
let sleep = (ms) =>
  new Promise((resolve) => (timeout = setTimeout(resolve, ms)));
let sleepstop = () => new Promise((resolve) => clearTimeout(timeout));


process.setMaxListeners(0);
var q5winner = [];
var tempwinner = [];
var fourcornerWinner=[];
var firstlineWinner = [];
var secondlineWinner = [];
var thirdlineWinner = [];
var fullhouseWinner = [];
var secondfullhouseWinner=[];
var thirdfullhouseWinner=[];
var winner=[]


mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const con = mongoose.connection;
MongooseAutoIncrementID.initialise('MyCustomName'); 
const plugin = new MongooseAutoIncrementID(TambolaSchema, 'MyTambola',{field:'id'});
plugin.applyPlugin()
  .then(() => {
  })
  .catch(e => {
  });
 TambolaSchema.plugin(MongooseAutoIncrementID.plugin, {modelName: 'MyTambola'});
const TambolaModel=mongoose.model('Playerdata',TambolaSchema)


con.on("open", () => {

app.use(
  cors({
    origin: "*",
    methods: "GET,POST,DELETE,PATCH,PUT",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    preflightContinue: true,
  })
);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//rebooting system

app.get("/system/reboot",cors(), (req, res)=> {
	process.exit(1)
  res.send('ok')
})
app.get('/privatekey',async(req,res)=>{
  var data=await PrivateKey.find();
  res.json(data);
})

app.post('/privatekey',async(req,res)=>{
  var key=req.body.key;
  var data=new PrivateKey({
    key:key
  })

    
  try{
    data.save();
  }
  catch(e){
    console.log('key not saved');
  }
})

app.get('/anounced',async(req,res)=>{
  var data=await ListModel.find();
  res.json(data);
})

app.get("/", (req, res) => {
  res.send("this is backend last");
});
app.get('/Timings',async(req,res)=>{
const data=await TimingModel.find();
res.json(data)
})

app.post('/Timings', async (req,res)=>{
  await con.collection('timings').drop()

const StartingTime=req.body.time

const createTime=new TimingModel({
  startTime:StartingTime
})

try {
  createTime.save();
} catch (e) {
  console.log("error");
  res.send(e);
}

})


app.post("/createProfile",cors(), async (req, res) => {

  var ticket=req.body.Ticket;

  const flat = ticket.flat(1);
  let unique = [...new Set(flat)];
  if(unique.length===16){
    const Userlist = new TambolaModel({
      ticket: req.body.Ticket,
      color:  req.body.color
    });
    try {
     var r= Userlist.save();
    } catch (e) {
      console.log("error");
      res.send(e);
    }
  }
  
});

app.get("/getList", async (req, res) => {
  const data = await TambolaModel.find();
  res.json(data);
});

app.get("/getwinnerlist", async (req, res) => {
  const data = await WinnerModel.find();
  res.json(data);
});

app.delete("/removeTicket", async (req, res) => {
  const { id } = req.query;
   await TambolaModel.findByIdAndDelete(id);
});

app.patch("/changeusername",async (req,res)=>{
   const {id,username,agentName,mobile} =req.body


for(var j=0;j<id.length;j++){

  var list=await TambolaModel.find({id:id[j]})
console.log(mobile)
  if(list[0].username==='Available'){

    const data=await TambolaModel.updateMany({id:id[j]},{username:username,agentName:agentName,mobile:mobile})
  }
}



})

app.get("/reset", async (req, res) => {
  await con.collection('winnerlists').drop()
});
app.get("/playerremove", async (req, res) => {
  await con.collection('playerdatas').drop()
  await con.collection('mycustomnames').drop()

});

app.get("/getList/:id", async (req, res) => {
  const id = req.params.id;
  const data = await TambolaModel.find({ id:id });
  res.json(data);
});

app.get("/getgroup/:id", async (req, res) => {
  const id = req.params.id;
  const data = await TambolaModel.find({ mobile:id });
  res.json(data);
});



io.on("connection",async (socket) => {
 var wontime=false;
  var list = [];
   var datas = await TambolaModel.find();
  socket.on("starts", async (data) => {

    const quickfiveCheck = async(data, anouncedlist) => {

      var winnerlist = [];
      for (var i = 0; i < data.length; i++) {
       
       var count = [];
        const flat = data[i].ticket.flat();
        let ar = [...new Set(flat)];
        let unique=ar.filter(item=>item!==0)
        for (var r = 0; r < unique.length; r++) {
          if (anouncedlist.includes(unique[r])) {
            count.push(unique[r]);
          }
          if (count.length === 5) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
        }
       
      }
      q5winner = [...winnerlist];
    if(q5winner.length>0){
      await sleep(3000);
 wontime=true;
      socket.broadcast.emit('q5taken');
      await sleep(5000);
    }
    };
    const fourcornerwinnercheck=async(data,anouncedlist)=>{
      var winnerlist = [];
    
      for (var i = 0; i < data.length; i++) {
       var  countfourcorner = [];
        const flat = data[i].ticket.flat(1);
        let unique = [...new Set(flat)];
        let index = unique.indexOf(0);
        if (index > -1) {
          unique.splice(index, 1);
        }
          if ( anouncedlist.includes(unique[0])) 
          {
          countfourcorner.push(unique[0])
          }
          if ( anouncedlist.includes(unique[10])) 
          {
          countfourcorner.push(unique[10])
          }
          if ( anouncedlist.includes(unique[4])) 
          {
          countfourcorner.push(unique[4])
          }
          if ( anouncedlist.includes(unique[14])) 
          {
          countfourcorner.push(unique[14])
          }
          
          if (countfourcorner.length === 4) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
      }
     fourcornerWinner = [...winnerlist];
     if(fourcornerWinner.length>0){
      await sleep(3000);
  wontime=true
      socket.broadcast.emit('fourcornertaken');
      await sleep(5000);
    }
    }
    const firstlinewinnercheck =async (data, anouncedlist) => {
      var winnerlist = [];
    
      for (var i = 0; i < data.length; i++) {
       var countfirst = [];
        const flat = data[i].ticket.flat(1);
        let unique = [...new Set(flat)];
        let index = unique.indexOf(0);
        if (index > -1) {
          unique.splice(index, 1);
        }
    
        for (var r = 0; r < 5; r++) {
          if (
            anouncedlist.includes(unique[r])
          ) {
            countfirst.push(unique[r])
          }
          if (countfirst.length === 5) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
        }
      }
      firstlineWinner = [...winnerlist];
      if(firstlineWinner.length>0){
      await sleep(3000);
wontime=true
        socket.broadcast.emit('firstlinetaken');
        await sleep(5000);
      }
    };
    const secondlinewinnercheck =async (data, anouncedlist) => {
      var winnerlist = [];
    
      for (var i = 0; i < data.length; i++) {
       var  countsecond = [];
        const flat = data[i].ticket.flat(1);
        let unique = [...new Set(flat)];
        let index = unique.indexOf(0);
        if (index > -1) {
          unique.splice(index, 1);
        }
    
        for (var r = 5; r < 10; r++) {
          if (
            anouncedlist.includes(unique[r])
          ) {
            countsecond.push(unique[r])
          }
          if (countsecond.length === 5) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
        }
      }
      secondlineWinner = [...winnerlist];
      if(secondlineWinner.length>0){
      await sleep(3000);
      wontime=true
        socket.broadcast.emit('secondlinetaken');
        await sleep(5000);
      }
    };
    const thirdlinewinnercheck = async(data, anouncedlist) => {
      var winnerlist = [];
    
      for (var i = 0; i < data.length; i++) {
        var countthird = [];
        const flat = data[i].ticket.flat(1);
        let unique = [...new Set(flat)];
        let index = unique.indexOf(0);
        if (index > -1) {
          unique.splice(index, 1);
        }
    
        for (var r = 10; r < 15; r++) {
          if (
            anouncedlist.includes(unique[r])
          ) {
            countthird.push(unique[r])
          }
          if (countthird.length === 5) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
        }
      }
      thirdlineWinner = [...winnerlist];
      if(thirdlineWinner.length>0){
      await sleep(3000);
 wontime=true
        socket.broadcast.emit('thirdlinetaken');
        await sleep(5000);
      }
    };
    const firstFullhousecheck=async(data,anouncedlist)=>{
      var winnerlist = [];
    
      for (var i = 0; i < data.length; i++) {
        var countfull = [];
        const flat = data[i].ticket.flat(1);
        let unique = [...new Set(flat)];
        let index = unique.indexOf(0);
        if (index > -1) {
          unique.splice(index, 1);
        }
    
        for (var r = 0; r < 15; r++) {
          if (
            anouncedlist.includes(unique[r])
          ) {
            countfull.push(unique[r])
          }
          if (countfull.length === 15) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
        }
      }
     fullhouseWinner = [...winnerlist];
     if(fullhouseWinner.length>0){
      await sleep(3000);
      wontime=true
      socket.broadcast.emit('fullhousetaken');
      await sleep(5000);
    }
    }
    const secondFullhousecheck=async(data,anouncedlist)=>{
      var winnerlist = [];
      for (var i = 0; i < data.length; i++) {
        var countfull = [];
        const flat = data[i].ticket.flat(1);
        let unique = [...new Set(flat)];
        let index = unique.indexOf(0);
        if (index > -1) {
          unique.splice(index, 1);
        }
    
        for (var r = 0; r < 15; r++) {
          if (
            anouncedlist.includes(unique[r])
          ) {
            countfull.push(unique[r])
          }
          if (countfull.length === 15) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
        }
      }
     secondfullhouseWinner = [...winnerlist];
     if(secondfullhouseWinner.length>0){
      await sleep(3000);
wontime=true
      socket.broadcast.emit('secondfullhousetaken');
      await sleep(5000);
    }
    }
    const thirdFullhousecheck=async(data,anouncedlist)=>{
      var winnerlist = [];
      for (var i = 0; i < data.length; i++) {
        var countfull = [];
        const flat = data[i].ticket.flat(1);
        let unique = [...new Set(flat)];
        let index = unique.indexOf(0);
        if (index > -1) {
          unique.splice(index, 1);
        }
    
        for (var r = 0; r < 15; r++) {
          if (
            anouncedlist.includes(unique[r])
          ) {
            countfull.push(unique[r])
          }
          if (countfull.length === 15) {
            winnerlist.push([data[i].username,data[i].id]);
            break;
          }
        }
      }
     thirdfullhouseWinner = [...winnerlist];
     if(thirdfullhouseWinner.length>0){
      await sleep(3000);
      wontime=true
      socket.broadcast.emit('thirdfullhousetaken');
      await sleep(5000);
    }
    }
    
    let winnercheck = (data,list,listing=[]) => {
      if (q5winner.length===0&& listing.includes('Quick Five')) {
      quickfiveCheck(data,list);
      }
      if (fourcornerWinner.length===0 &&  listing.includes('Four Corners')){
         fourcornerwinnercheck(data,list);
      }
    
      if (firstlineWinner.length===0&&  listing.includes('Top Line')){
         firstlinewinnercheck(data,list);
        firstFullhousecheck(data,list);
      }
    
      if (secondlineWinner.length===0&&  listing.includes('Middle Line')){
        secondlinewinnercheck(data,list);
        firstFullhousecheck(data,list);
    
      }
    
      if (thirdlineWinner.length===0 &&  listing.includes('Bottom Line')){
          thirdlinewinnercheck(data,list);
       firstFullhousecheck(data,list);
    
      }
    
      if(firstlineWinner.length!=0 && secondlineWinner.length!==0 && thirdlineWinner.length!==0&&fullhouseWinner.length===0 &&  listing.includes('Fullhouse')){
         firstFullhousecheck(data,list);
      }
    
    
    
      if(firstlineWinner.length!=0 && secondlineWinner.length!==0 && thirdlineWinner.length!==0 && fullhouseWinner.length!==0 && secondfullhouseWinner.length===0 &&  listing.includes('Second Fullhouse')){
    var finishedlist=[]
    finalnewlist=data;
    
    
    
    fullhouseWinner.map((item)=>{
           finishedlist.push(item[1])
    
        })
    finishedlist.map(item=>{
      finalnewlist=finalnewlist.filter(s=>s.id!==item);
    
    })
    
        secondFullhousecheck(finalnewlist,list);
      }
    
    
      if(fullhouseWinner.length!==0 && secondfullhouseWinner.length!==0 && thirdfullhouseWinner.length===0 &&  listing.includes('Third Fullhouse')){
       console.log('third check')
        var final=[]
    var finishedlist=[]
    
        finalnewlist=data;
        fullhouseWinner.map((item)=>{
          //  finalnewlist = data.filter(s=>s.id!==item[1])
           finishedlist.push(item[1])
        })
        secondfullhouseWinner.map(item=>{
          finishedlist.push(item[1])
        })
        finishedlist.map(item=>{
          finalnewlist=finalnewlist.filter(s=>s.id!==item);
        
        })
    
    
         thirdFullhousecheck(finalnewlist,list);
       }
    
    return [{name:'Quick Five',list:q5winner},
    {name:'Temperature',list:tempwinner},
    {name:'Four Corners',list:fourcornerWinner},
    {name:'Top Line',list:firstlineWinner},
    {name:'Middle Line',list:secondlineWinner},
    {name:'Bottom Line',list:thirdlineWinner},
    {name:'Fullhouse',list:fullhouseWinner},
    {name:'Second Fullhouse',list:secondfullhouseWinner},
    {name:'Third Fullhouse',list:thirdfullhouseWinner}
  ]
    };






    if (data?.condition === false) {
      await sleepstop();
    }
    
  console.log('connected',socket.id)
    if (data?.condition === true) {
  var generatedRandom = tambola.getDrawSequence();
  console.log('game started')
  var listing=data?.listing
      for (var i = 0; i < 91; i++) {
    
        var item = generatedRandom[i];
        list.push(item);
        if (i < 90) {
          if(wontime){
            await sleep(3000);
          }
          socket.emit("number", item, list);
          socket.broadcast.emit("number", item, list);
          if (i === 0) {
            const listmodel = new ListModel({
              collectionid: 0,
              random: item,
              list,
            });
            try {
              listmodel.save();
            } catch (e) {
              res.send(e);
            }
          } else {
            const res = await ListModel.updateMany(
              { collectionid: 0 },
              { list, random: item }
            );
          }
          
          wontime=false
          winner=winnercheck(datas,list,listing);
         

          socket.broadcast.emit('winnerlist',winner)
        
          
        } else {
        }
        if(thirdfullhouseWinner.length!==0){
          const winnersave=new WinnerModel({
           winnerlist:winner
          })
          try {
          winnersave.save();
          socket.broadcast.emit('gamefinished');

          } catch (e) {
          }
          break;
        }

        
        await sleep(8000);
      }
    }

  });
  socket.on('disconnect',()=>{
    console.log('disconnected',socket.id)
  })
  socket.on("message",(message)=>{
    console.log(message)
     socket.broadcast.emit('gotoend' ,message);
  })

  
});

});

con.on('disconnect',()=>{
  console.log('disconnected')
})

server.listen(PORT, () => {
  console.log("listening at PORT : " + PORT);
});


