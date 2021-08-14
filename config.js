const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  PORT: process.env.PORT||9000,
  SOCKETPORT:process.env.SOCKETPORT,
};