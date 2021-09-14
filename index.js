const express = require("express");
const { PORT } = require("./config");
const app = express();
const http = require("http");
var bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { MongooseAutoIncrementID } = require("mongoose-auto-increment-reworked");
const TambolaSchema = require("./models/uploadData");
const PrivateKey = require("./models/Password");
const ListModel = require("./models/ticketList");
const WinnerModel = require("./models/winnerlist");
const TimingModel = require("./models/GameTiming");
var tambola = require("tambola");
const schedule = require('node-schedule');
const moment=require('moment')

const {
  quickfiveCheck,
  fourcornerwinnercheck,
  firstlinewinnercheck,
  secondlinewinnercheck,
  thirdlinewinnercheck,
  firstFullhousecheck,
  secondFullhousecheck,
  thirdFullhousecheck,
  halfSheetWinnerCheck,
  fullSheetWinnerCheck,
  temperatureCheck
} = require("./checks/winnerchecks");
const { start } = require("repl");

var finalnewlist = [];
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

var timeout = null;
let sleep = (ms) =>
  new Promise((resolve) => (timeout = setTimeout(resolve, ms)));
let sleepstop = () => new Promise((resolve) => clearTimeout(timeout));
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,DELETE,PATCH,PUT",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    preflightContinue: true,
  })
);
process.setMaxListeners(0);

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const con = mongoose.connection;
MongooseAutoIncrementID.initialise("MyCustomName");
const plugin = new MongooseAutoIncrementID(TambolaSchema, "MyTambola", {
  field: "id",
});
plugin
  .applyPlugin()
  .then(() => {})
  .catch((e) => {});
TambolaSchema.plugin(MongooseAutoIncrementID.plugin, {
  modelName: "MyTambola",
});
const TambolaModel = mongoose.model("Playerdata", TambolaSchema);

con.on("open", () => {
  
  app.use(express.static(__dirname + "/public"));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  //rebooting system

  app.get("/system/reboot", cors(), (req, res) => {
    process.exit(1);
    res.send("ok");
  });
  app.get("/privatekey", async (req, res) => {
    var data = await PrivateKey.find();
    res.json(data);
  });

  app.post("/privatekey", async (req, res) => {
    var key = req.body.key;
    var data = new PrivateKey({
      key: key,
    });

    try {
      data.save();
    } catch (e) {
      console.log("key not saved");
    }
  });

  app.get("/anounced", async (req, res) => {
    var data = await ListModel.find();
    res.json(data);
  });

  app.get("/", (req, res) => {
    res.send("this is backend last");
  });
  app.get("/Timings", async (req, res) => {
    const data = await TimingModel.find();
    res.json(data);
  });

  app.post("/Timings", async (req, res) => {
    await con.collection("timings")?.drop();
    const StartingTime = req.body.time;

    const createTime = new TimingModel({
      startTime: StartingTime,
    });

    try {
      createTime.save();
    } catch (e) {
      console.log("error");
      res.send(e);
    }
  });

  app.post("/createProfile", cors(), async (req, res) => {
    var ticket = req.body.Ticket;

    const flat = ticket.flat(1);
    let unique = [...new Set(flat)];
    if (unique.length === 16) {
      const Userlist = new TambolaModel({
        ticket: req.body.Ticket,
        color: req.body.color,
      });
      try {
        var r = Userlist.save();
      } catch (e) {
        console.log("error");
        res.send(e);
      }
    }
    res.send('created')
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

  app.patch("/changeusername", async (req, res) => {
    const { id, username, agentName, mobile } = req.body;
  
    for (var j = 0; j < id.length; j++) {
      var list = await TambolaModel.find({ id: id[j] });
    
      if (list[0].username === "Available") {
        const data = await TambolaModel.updateMany(
          { id: id[j] },
          { username: username, agentName: agentName, mobile: mobile }
        );
      }
    }
  });

  app.get("/reset", async (req, res) => {
    await con.collection("winnerlists").drop();
  });
  app.get("/playerremove", async (req, res) => {
    await con.collection("playerdatas").drop();
    await con.collection("mycustomnames").drop();
  });

  app.get("/getList/:id", async (req, res) => {
    const id = req.params.id;
    const data = await TambolaModel.find({ id: id });
    res.json(data);
  });

  app.get("/getgroup/:id", async (req, res) => {
    const id = req.params.id;
    const data = await TambolaModel.find({ mobile: id });
    res.json(data);
  });

  var q5winner = [];
  var tempwinner = [];
  var fourcornerWinner = [];
  var firstlineWinner = [];
  var secondlineWinner = [];
  var thirdlineWinner = [];
  var fullhouseWinner = [];
  var secondfullhouseWinner = [];
  var thirdfullhouseWinner = [];
  var fullSheetWinner = [];
  var halfSheetWinner = [];
  var winner = [];
  

  io.on("connection", async (socket) => {
    
    var wontime = false;
    var list = [];
    var datas = await TambolaModel.find();
    app.get('/start', async(req,res)=>{

     var data=req.query;
      var res=  await TimingModel.find()
      var d1= new Date(res[0].startTime);
      var sometime = moment(d1).format()
  
  console.log(sometime)
  schedule.scheduleJob(sometime, function(){
   startgame(data);
     });
  
    })
    
  let winnercheck = async (datas, list, listing = []) => {
    var data = datas.sort((a, b) => a.id - b.id);
    if (q5winner.length === 0 && listing.includes("Quick Five")) {
      q5winner =await quickfiveCheck(data, list);
      if (q5winner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("q5taken");
        await sleep(5000);
      }
    }
   
     if(tempwinner.length===0 && listing.includes('Temperature')) {
tempwinner=await temperatureCheck(data,list);
if (tempwinner.length > 0) {
  await sleep(3000);
  wontime = true;
  socket.broadcast.emit("temptaken");
  await sleep(5000);
}
     }

    if (fourcornerWinner.length === 0 && listing.includes("Four Corners")) {
      fourcornerWinner =await fourcornerwinnercheck(data, list);
      if (fourcornerWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("fourcornertaken");
        await sleep(5000);
      }
    }

    if (firstlineWinner.length === 0 && listing.includes("Top Line")) {
      firstlineWinner =await firstlinewinnercheck(data, list);
      fullhouseWinner =await firstFullhousecheck(data, list);

      if (firstlineWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("firstlinetaken");
        await sleep(5000);
      }
      if (fullhouseWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("fullhousetaken");
        await sleep(5000);
      }
    }

    if (secondlineWinner.length === 0 && listing.includes("Middle Line")) {
      secondlineWinner =await secondlinewinnercheck(data, list);
      fullhouseWinner =await firstFullhousecheck(data, list);
      if (secondlineWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("secondlinetaken");
        await sleep(5000);
      }
      if (fullhouseWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("fullhousetaken");
        await sleep(5000);
      }
    }

    if (thirdlineWinner.length === 0 && listing.includes("Bottom Line")) {
      thirdlineWinner =await thirdlinewinnercheck(data, list);
      fullhouseWinner = await firstFullhousecheck(data, list);
      if (thirdlineWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("thirdlinetaken");
        await sleep(5000);
      }
      if (fullhouseWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("fullhousetaken");
        await sleep(5000);
      }
    }

    if (halfSheetWinner.length === 0 && listing.includes("Half Sheet")) {
      halfSheetWinner =await halfSheetWinnerCheck(data, list);
      if (halfSheetWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("halfSheetTaken");
        await sleep(5000);
      }
    }
    if (
      firstlineWinner.length !== 0 &&
      secondlineWinner.length !== 0 &&
      thirdlineWinner.length !== 0 &&
      fullhouseWinner.length === 0 &&
      listing.includes("Fullhouse")
    ) {
      fullhouseWinner =await firstFullhousecheck(data, list);
      if (fullhouseWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("fullhousetaken");
        await sleep(5000);
      }
    }

    if (
      fullSheetWinner.length === 0 &&
      listing.includes("Full Sheet")
    ) {
      console.log('fulsheet checking')
      fullSheetWinner =await fullSheetWinnerCheck(data, list);
      if (fullSheetWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("fullsheetTaken");
        await sleep(5000);
      }
    }

    if (
      firstlineWinner.length != 0 &&
      secondlineWinner.length !== 0 &&
      thirdlineWinner.length !== 0 &&
      fullhouseWinner.length !== 0 &&
      secondfullhouseWinner.length === 0 &&
      listing.includes("Second Fullhouse")
    ) {
      var finishedlist = [];
      finalnewlist = data;

      fullhouseWinner.map((item) => {
        finishedlist.push(item[1]);
      });
      finishedlist.map((item) => {
        finalnewlist = finalnewlist.filter((s) => s.id !== item);
      });

      secondfullhouseWinner =await secondFullhousecheck(finalnewlist, list);
      if (secondfullhouseWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("secondfullhousetaken");
        await sleep(5000);
      }
    }

    if (
      fullhouseWinner.length !== 0 &&
      secondfullhouseWinner.length !== 0 &&
      thirdfullhouseWinner.length === 0 &&
      listing.includes("Third Fullhouse")
    ) {
      console.log("third check");
      var final = [];
      var finishedlist = [];

      finalnewlist = data;
      fullhouseWinner.map((item) => {
        //  finalnewlist = data.filter(s=>s.id!==item[1])
        finishedlist.push(item[1]);
      });
      secondfullhouseWinner.map((item) => {
        finishedlist.push(item[1]);
      });
      finishedlist.map((item) => {
        finalnewlist = finalnewlist.filter((s) => s.id !== item);
      });

      thirdfullhouseWinner =await thirdFullhousecheck(finalnewlist, list);
      if (thirdfullhouseWinner.length > 0) {
        await sleep(3000);
        wontime = true;
        socket.broadcast.emit("thirdfullhousetaken");
        await sleep(5000);
      }
    }

    return [
      { name: "Quick Five", list: q5winner },
      { name: "Temperature", list: tempwinner },
      { name: "Four Corners", list: fourcornerWinner },
      { name: "Top Line", list: firstlineWinner },
      { name: "Middle Line", list: secondlineWinner },
      { name: "Bottom Line", list: thirdlineWinner },
      { name: "Fullhouse", list: fullhouseWinner },
      { name: "Second Fullhouse", list: secondfullhouseWinner },
      { name: "Third Fullhouse", list: thirdfullhouseWinner },
      { name: "Half Sheet", list: halfSheetWinner },
      { name: "Full Sheet", list: fullSheetWinner },
    ];
  };

  async function startgame(data){
    var generatedRandom = tambola.getDrawSequence();
          console.log("game started");
          var listing = data?.listing;
          for (var i = 0; i < 91; i++) {
            var item = generatedRandom[i];
            list.push(item);
            if (i < 90) {
              if (wontime) {
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
              wontime = false;
              
            winner=await  winnercheck(datas, list, listing);
              socket.broadcast.emit("winnerlist", winner);
            }
  
            if (fullSheetWinner.length > 0) {
              const winnersave = new WinnerModel({
                winnerlist: winner,
              });
              try {
                winnersave.save();
                socket.broadcast.emit("gamefinished");
              } catch (e) {}
              break;
            }
  
            await sleep(8000);
          }
        }
      
    socket.on("starts", async (data) => {
      
      if (data?.condition === false) {
        await sleepstop();
      }

      if (data?.condition === true) {
        console.log(data)
   startgame(data);
      }
    });




    socket.on("disconnect", () => {
      console.log("disconnected", socket.id);
    });
    socket.on("message", (message) => {
      console.log(message);
      socket.broadcast.emit("gotoend", message);
    });
  });
});

con.on("disconnect", () => {
});

server.listen(PORT, () => {
  console.log("listening at PORT : " + PORT);
});
