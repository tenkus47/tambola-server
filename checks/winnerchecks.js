const uniqueArraymaker = (data=[]) => {
  const flat = data?.flat(1);
  let unique = [...new Set(flat)];

  let index = unique?.indexOf(0);
  if (index > -1) {
    unique?.splice(index, 1);
  }
  return unique;
};

const similarElementNumbers = (array1 = [], array2 = []) => {
  var list = array1.filter((item) => array2.includes(item));
  return list.length;
};


const temperatureCheck = async (data, anouncedlist) => {
    var winnerlist = [];
    for (var i = 0; i < data.length; i++) {
      var count = [];
      const flat = data[i].ticket.flat();
      let ar = [...new Set(flat)];
      let unique = ar.filter((item) => item !== 0);
      let sorted=unique.sort((a,b)=>a-b)
      for (var r = 0; r < unique.length; r++) {
        if (anouncedlist.includes(sorted[0])) {
          count.push(sorted[0]);
        }
        if (anouncedlist.includes(sorted[14])) {
            count.push(sorted[14]);
          }
        if (count.length === 2) {
          winnerlist.push([data[i].username, data[i].id]);
          break;
        }
        count =[]
      }
   
    }
    temperature = [...winnerlist];
    return temperature;
  };

 const quickfiveCheck = async (data, anouncedlist) => {
  var winnerlist = [];
  for (var i = 0; i < data.length; i++) {
    var count = [];
    const flat = data[i].ticket.flat();
    let ar = [...new Set(flat)];
    let unique = ar.filter((item) => item !== 0);
    for (var r = 0; r < unique.length; r++) {
      if (anouncedlist.includes(unique[r])) {
        count.push(unique[r]);
      }
      if (count.length === 5) {
        winnerlist.push([data[i].username, data[i].id]);
        break;
      }
    }
  }
  q5winner = [...winnerlist];
  return q5winner;
};
 const fourcornerwinnercheck = async (data, anouncedlist) => {
  var winnerlist = [];

  for (var i = 0; i < data.length; i++) {
    var countfourcorner = [];
    const flat = data[i].ticket.flat(1);
    let unique = [...new Set(flat)];
    let index = unique.indexOf(0);
    if (index > -1) {
      unique.splice(index, 1);
    }
    if (anouncedlist.includes(unique[0])) {
      countfourcorner.push(unique[0]);
    }
    if (anouncedlist.includes(unique[10])) {
      countfourcorner.push(unique[10]);
    }
    if (anouncedlist.includes(unique[4])) {
      countfourcorner.push(unique[4]);
    }
    if (anouncedlist.includes(unique[14])) {
      countfourcorner.push(unique[14]);
    }

    if (countfourcorner.length === 4) {
      winnerlist.push([data[i].username, data[i].id]);
      break;
    }
  }
  fourcornerWinner = [...winnerlist];
  
  return fourcornerWinner;
}; 
const firstlinewinnercheck = async (data, anouncedlist) => {
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
      if (anouncedlist.includes(unique[r])) {
        countfirst.push(unique[r]);
      }
      if (countfirst.length === 5) {
        winnerlist.push([data[i].username, data[i].id]);
        break;
      }
    }
  }
  firstlineWinner = [...winnerlist];
  
  return firstlineWinner
};
 const secondlinewinnercheck = async (data, anouncedlist) => {
  var winnerlist = [];

  for (var i = 0; i < data.length; i++) {
    var countsecond = [];
    const flat = data[i].ticket.flat(1);
    let unique = [...new Set(flat)];
    let index = unique.indexOf(0);
    if (index > -1) {
      unique.splice(index, 1);
    }

    for (var r = 5; r < 10; r++) {
      if (anouncedlist.includes(unique[r])) {
        countsecond.push(unique[r]);
      }
      if (countsecond.length === 5) {
        winnerlist.push([data[i].username, data[i].id]);
        break;
      }
    }
  }
  secondlineWinner = [...winnerlist];
 
  return secondlineWinner
};
 const thirdlinewinnercheck = async (data, anouncedlist) => {
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
      if (anouncedlist.includes(unique[r])) {
        countthird.push(unique[r]);
      }
      if (countthird.length === 5) {
        winnerlist.push([data[i].username, data[i].id]);
        break;
      }
    }
  }
  thirdlineWinner = [...winnerlist];
 

  return thirdlineWinner
};
 const firstFullhousecheck = async (data, anouncedlist) => {
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
      if (anouncedlist.includes(unique[r])) {
        countfull.push(unique[r]);
      }
      if (countfull.length === 15) {
        winnerlist.push([data[i].username, data[i].id]);
        break;
      }
    }
  }
  fullhouseWinner = [...winnerlist];
 
  return fullhouseWinner
};
const secondFullhousecheck = async (data, anouncedlist) => {
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
      if (anouncedlist.includes(unique[r])) {
        countfull.push(unique[r]);
      }
      if (countfull.length === 15) {
        winnerlist.push([data[i].username, data[i].id]);
        break;
      }
    }
  }
  secondfullhouseWinner = [...winnerlist];
 
  return secondfullhouseWinner
};
const thirdFullhousecheck = async (data, anouncedlist) => {
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
      if (anouncedlist.includes(unique[r])) {
        countfull.push(unique[r]);
      }
      if (countfull.length === 15) {
        winnerlist.push([data[i].username, data[i].id]);
        break;
      }
    }
  }
  thirdfullhouseWinner = [...winnerlist];

  return thirdfullhouseWinner
};

 const halfSheetWinnerCheck = async (data, anouncedlist) => {
  var winnerlist = [];
  for (var i = 0; i < data.length; i = 3 + i) {
    if (
      data[i]?.mobile === data[i + 1]?.mobile &&
      data[i + 1]?.mobile === data[i + 2]?.mobile
    ){
   
    const ticket1 = uniqueArraymaker(data[i]?.ticket);
    const ticket2 = uniqueArraymaker(data[i + 1]?.ticket);
    const ticket3 = uniqueArraymaker(data[i + 2]?.ticket);
    var similar1 = similarElementNumbers(ticket1, anouncedlist);
    var similar2 = similarElementNumbers(ticket2, anouncedlist);
    var similar3 = similarElementNumbers(ticket3, anouncedlist);

    if (similar1 === 2 && similar2 === 2 && similar3 === 2) {
        winnerlist.push([data[i].username, data[i].id]);
        winnerlist.push([data[i + 1].username, data[i + 1].id]);
        winnerlist.push([data[i + 2].username, data[i + 2].id]);
      }
    }
  }
  halfSheetWinner = [...winnerlist];
  
  return halfSheetWinner
};

 const fullSheetWinnerCheck = async (data, anouncedlist) => {
  var winnerlist = [];

  for (var i = 0; i < data.length; i = i + 6) {
  if (
    data[i]?.mobile === data[i + 1]?.mobile &&
    data[i + 1]?.mobile === data[i + 2].mobile &&
    data[i + 2]?.mobile === data[i + 3].mobile &&
    data[i + 3]?.mobile === data[i + 4].mobile &&
    data[i + 4]?.mobile === data[i + 5].mobile &&
    data[i + 5]?.mobile === data[i + 6].mobile
  ) {
    const ticket1 = uniqueArraymaker(data[i]?.ticket);
    const ticket6 = uniqueArraymaker(data[i + 5]?.ticket); 
    const firstlinematch= anouncedlist.includes(ticket1[0]) && anouncedlist.includes(ticket1[10])
    const lastlinematch= anouncedlist.includes(ticket6[4]) && anouncedlist.includes(ticket6[14])
    if (
        firstlinematch && lastlinematch
      ) {
        winnerlist.push([data[i].username, data[i].id]);
        winnerlist.push([data[i + 1].username, data[i + 1].id]);
        winnerlist.push([data[i + 2].username, data[i + 2].id]);
        winnerlist.push([data[i + 3].username, data[i + 3].id]);
        winnerlist.push([data[i + 4].username, data[i + 4].id]);
        winnerlist.push([data[i + 5].username, data[i + 5].id]);
      }
    }
  }
  fullSheetWinner = [...winnerlist];
  return fullSheetWinner
};









module.exports= {quickfiveCheck,fourcornerwinnercheck,firstlinewinnercheck,secondlinewinnercheck,thirdlinewinnercheck,firstFullhousecheck,secondFullhousecheck,
    thirdFullhousecheck,halfSheetWinnerCheck,fullSheetWinnerCheck,temperatureCheck}