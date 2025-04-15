const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

// Allow all origins for now (you can restrict this to your frontend domain later for security)
app.use(cors({ origin: "*" }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",  // Allow all origins for development
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (roomID) => {
    socket.join(roomID);
    socket.to(roomID).emit("user-joined", socket.id);
  });

  socket.on("signal", ({ roomID, signal, to }) => {
    io.to(to).emit("signal", { from: socket.id, signal });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
