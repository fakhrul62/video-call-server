const process = require("process");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
window.process = process;


const app = express();

// Allow all origins for now (you can restrict this to your frontend domain later for security)
app.use(cors({ origin: "*" }));

const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "*", // or specify your frontend domain
      methods: ["GET", "POST"],
    },
  });

  const rooms = {};

  io.on("connection", (socket) => {
    socket.on("join", (roomID) => {
      if (!rooms[roomID]) rooms[roomID] = [];
      rooms[roomID].push(socket.id);
  
      const otherUsers = rooms[roomID].filter(id => id !== socket.id);
      socket.join(roomID);
      
      // Send list of existing users to the new user
      socket.emit("all-users", otherUsers);
  
      // Notify others that a new user joined
      socket.to(roomID).emit("user-joined", socket.id);
  
      socket.on("signal", ({ to, from, signal }) => {
        io.to(to).emit("signal", { from, signal });
      });
  
      socket.on("disconnect", () => {
        rooms[roomID] = rooms[roomID].filter(id => id !== socket.id);
        socket.to(roomID).emit("user-disconnected", socket.id);
      });
    });
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
