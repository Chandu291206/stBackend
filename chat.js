import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

let users = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register", (username) => {
    users[username] = socket.id;
    console.log(`${username} registered with ID ${socket.id}`);
  });

  socket.on("private_message",({ sender,receiver,message }) => {
    const receiverId = users[receiver];
    if (receiverId) {
      io.to(receiverId).emit("private_message",{ sender,message});
    }
  });

  socket.on("disconnect", () => {
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
