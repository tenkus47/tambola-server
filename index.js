const express = require("express");
// import process from 'process'
const {  SOCKETPORT } = require("./config");
const app = express();
var bodyParser = require("body-parser");
const TicketGenerate = require("./Route/TicketGenerate");
const cors = require("cors");
const mongoose = require("mongoose");
const TambolaModel = require("./models/uploadData");
const ListModel = require("./models/ticketList");
const WinnerModel=require('./models/winnerlist')
var tambola = require("tambola");

const io = require("socket.io")(5000, {
  cors: {
    origin: "*",
  },
});

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const con = mongoose.connection;

con.on("open", () => {
  console.log("database connected");
});

app.use("/GenerateTicket", TicketGenerate);
app.use(
  cors({
    origin: "*",
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    preflightContinue: true,
  })
);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/system/reboot", (req, res)=> {
	process.exit(1)
})

app.get("/", (req, res) => {
  res.send("this is backend");
});

app.post("/createProfile", async (req, res) => {
  var number = (await TambolaModel.find().countDocuments()) + 1;
  const l = await TambolaModel.find({ id: number });
  if (l[0]?.id === number) {
    number = Math.floor(Math.random() * 900);
  }
  const Userlist = new TambolaModel({
    id: number,
    username: req.body.userName,
    ticket: req.body.Ticket,
    gpay: req.body.Gpay,
  });
  try {
    Userlist.save();
  } catch (e) {
    console.log("error");
    res.send(e);
  }
});

app.get("/getList", async (req, res) => {
  const data = await TambolaModel.find();
  res.send('hi');
});

app.delete("/removeTicket", async (req, res) => {
  const { id } = req.query;
  const data = await TambolaModel.findByIdAndDelete(id);
});

app.get("/getList/:id", async (req, res) => {
  const id = req.params.id;
  const data = await TambolaModel.find({ id });
  res.json(data);
});
var timeout = null;
let sleep = (ms) =>
  new Promise((resolve) => (timeout = setTimeout(resolve, ms)));
let sleepstop = () => new Promise((resolve) => clearTimeout(timeout));
var count = [];
var countTemp = [];
var countfourcorner=[];
var countfirst=[];
var countsecond=[];
var countthird=[];
var countfull=[];

var q5winner = [];
var tempwinner = [];
var fourcornerWinner=[];
var firstlineWinner = [];
var secondlineWinner = [];
var thirdlineWinner = [];
var fullhouseWinner = [];
const quickfiveCheck = (data, anouncedlist) => {
  var breaks = false;
  var winnerlist = [];
  for (var i = 0; i < data.length; i++) {
   
    count = [];
    const flat = data[i].ticket.flat(1);
    let unique = [...new Set(flat)];
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
const tempwinnercheck = (data, anouncedlist) => {

  var winnerlist = [];


  for (var i = 0; i < data.length; i++) {
    countTemp=[]
    const flat = data[i].ticket.flat(1);
    let unique = [...new Set(flat)];
    const sorted = unique.sort((a, b) => a - b);
    for (var r = 0; r < sorted.length; r++) {
      if (anouncedlist.includes(sorted[1]) && anouncedlist.includes(sorted[15])) {
        countTemp.push(sorted[1]);
        countTemp.push(sorted[15]);
        winnerlist.push([data[i].username,data[i].id]);
      }
      if (countTemp.length === 2) {
        break;
      }
    }
  }
  tempwinner=[...winnerlist];
};
const foutcornerwinnercheck=(data,anouncedlist)=>{
  var winnerlist = [];

  for (var i = 0; i < data.length; i++) {
    countfourcorner = [];
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
      }if ( anouncedlist.includes(unique[4])) 
      {
      countfourcorner.push(unique[4])
      }if ( anouncedlist.includes(unique[14])) 
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
    countfirst = [];
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
    countsecond = [];
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
    countthird = [];
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
    countfull = [];
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
let winnercheck = async (list) => {
  const data = await TambolaModel.find();
  const anouncedlist = list;
  if (q5winner.length===0) {
    quickfiveCheck(data, anouncedlist);
  }
  if (tempwinner.length===0) {
    tempwinnercheck(data, anouncedlist);
  }
  if (fourcornerWinner.length===0){
    foutcornerwinnercheck(data,anouncedlist);
  }
  if (firstlineWinner.length===0){
    firstlinewinnercheck(data,anouncedlist);
    fullhouseWinnercheck(data,anouncedlist);

  }
  if (secondlineWinner.length===0){
    secondlinewinnercheck(data,anouncedlist);
    fullhouseWinnercheck(data,anouncedlist);

  }
  if (thirdlineWinner.length===0){
    thirdlinewinnercheck(data,anouncedlist);
    fullhouseWinnercheck(data,anouncedlist);

  }
  if(firstlineWinner.length!=0 && secondlineWinner.length!==0 && thirdlineWinner.length!=0&&fullhouseWinner.length===0){
    fullhouseWinnercheck(data,anouncedlist);
  }

return {q5winner,tempwinner,fourcornerWinner,firstlineWinner,secondlineWinner,thirdlineWinner,fullhouseWinner}
};
let pricesetter=(price)=>{
  var deduct=price-(price*0.10)
 var fullhouseP=deduct*0.25;
 var firstlineP=deduct*0.15;
 var thirdlineP=deduct*0.15;
 var secondlineP=deduct*0.15;
 var quick5P=deduct*0.10;
 var fourcornerP=deduct*0.10;
 var temperatureP=deduct*0.05;
  return {fullhouseP,firstlineP,thirdlineP,secondlineP,quick5P,fourcornerP,temperatureP}
}
console.log(process.pid)
io.on("connection", (socket) => {

  socket.on("disconnect", () => {
    console.log("disconnected");
  });
  var list = [];

  socket.on("starts", async (data,price) => {

    if (data === false) {
      await sleepstop();
    }
    if (data === true) {
      var generatedRandom = tambola.getDrawSequence();
      for (var i = 0; i < 91; i++) {
        var item = generatedRandom[i];
        list.push(item);
        await sleep(1000);
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
        const winner=  await winnercheck(list);
         const priceDistribution =pricesetter(price)

          socket.broadcast.emit('winnerlist',winner)
          socket.broadcast.emit('price',priceDistribution)
        
          
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
  
});


app.listen(PORT||process.env.PORT, () => {
  console.log("listening at PORT : " + PORT);
});
