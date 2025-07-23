// src/utils/pusher.js
const Pusher = require("pusher");
require("dotenv").config(); // Untuk mengambil kredensial dari .env

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER, // misal "ap1"
  useTLS: true,
});

module.exports = pusher;
