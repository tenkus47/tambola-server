const express = require("express");
const { PORT} = require("./config");
const app = express();
const http=require('http')
var bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const {MongooseAutoIncrementID} =require('mongoose-auto-increment-reworked');
const TambolaSchema= require("./models/uploadData");

const ListModel = require("./models/ticketList");
const WinnerModel=require('./models/winnerlist');
const TimingModel=require('./models/GameTiming');
var tambola = require("tambola");

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

app.get('/anounced',async(req,res)=>{
  var data=await ListModel.find();
  res.json(data);
})

app.get("/", (req, res) => {
  res.send("this is backend");
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
   const {option,username} =req.body
console.log(option,username)
  const data=await TambolaModel.updateMany({id:option},{username:username})
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




const quickfiveCheck = (data, anouncedlist) => {

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

};
const fourcornerwinnercheck=(data,anouncedlist)=>{
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
}
const firstlinewinnercheck = (data, anouncedlist) => {
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
};
const secondlinewinnercheck = (data, anouncedlist) => {
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
};
const thirdlinewinnercheck = (data, anouncedlist) => {
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
};
const fullhouseWinnercheck=(data,anouncedlist)=>{
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
}



let winnercheck = (data,list) => {
  if (q5winner.length===0) {
  quickfiveCheck(data,list);
  }
  if (fourcornerWinner.length===0){
     fourcornerwinnercheck(data,list);
  }

  if (firstlineWinner.length===0){
     firstlinewinnercheck(data,list);
    fullhouseWinnercheck(data,list);
  }

  if (secondlineWinner.length===0){
    secondlinewinnercheck(data,list);
    fullhouseWinnercheck(data,list);

  }

  if (thirdlineWinner.length===0){
      thirdlinewinnercheck(data,list);
   fullhouseWinnercheck(data,list);

  }

  if(firstlineWinner.length!=0 && secondlineWinner.length!==0 && thirdlineWinner.length!=0&&fullhouseWinner.length===0){


     fullhouseWinnercheck(data,list);

  }

return {q5winner,tempwinner,fourcornerWinner,firstlineWinner,secondlineWinner,thirdlineWinner,fullhouseWinner}
};

io.on("connection",async (socket) => {

  var list = [];
   var datas = await TambolaModel.find();
  var generatedRandom = tambola.getDrawSequence();
  socket.on("starts", async (data) => {
    if (data === false) {
      await sleepstop();
    }
    if (data === true) {
      for (var i = 0; i < 91; i++) {
        
        await sleep(3000);
        var item = generatedRandom[i];
        list.push(item);
        if (i < 90) {
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
              console.log("error");
              res.send(e);
            }
          } else {
            const res = await ListModel.updateMany(
              { collectionid: 0 },
              { list, random: item }
            );
          }
          
         
          const winner=winnercheck(datas,list);
         

          socket.broadcast.emit('winnerlist',winner)
        
          
        } else {
          console.log("game done");
        }
        if(fullhouseWinner.length!==0){
          const winnersave=new WinnerModel({
            quickfiveWinner:q5winner,
            fourcornerWinner:fourcornerWinner,
            temperatureWinner:tempwinner,
            firstlineWinner:firstlineWinner,
            secondlineWinner:secondlineWinner,
            thirdlineWinner:thirdlineWinner,
            fullhouseWinner:fullhouseWinner
          })
          try {
          winnersave.save();
          socket.broadcast.emit('gamefinished',fullhouseWinner);

          } catch (e) {
            console.log("error");
            // res.send(e);
          }
          break;
        }
      }
    }

  });
  
  socket.on("message",(message)=>{
    console.log(message)
     socket.broadcast.emit('gotoend' ,message);
  })
  process.on('beforeExit',()=>{
    const msg='server getting restarted';
    socket.broadcast.emit('serverdown',msg);
  })
  
});


console.log('connected')});

con.on('disconnect',()=>{
  console.log('disconnected')
})

server.listen(PORT, () => {
  console.log("listening at PORT : " + PORT);
});


