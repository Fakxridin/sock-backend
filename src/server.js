const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Io ni biriktirish
// app.set("io", io);

// require("./startup/socket")(io);

// Qolgan startuplar
require("./startup/logging")();
require("./startup/db")();
require("./startup/routes")(app);
require("./models/assosiations");

const { port } = require("./startup/config");

server.listen(port, () => {
  console.log(`🚀 Server ${port}da suzyapti!`);
});
