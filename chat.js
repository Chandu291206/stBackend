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

// Maps for quick lookups
// username -> socketId
let usersByName = {};
// socketId -> username
let usersById = {};
// socketId -> allowed recipient names (provided by client UI like Cside.jsx)
let recipientsBySocket = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const attachUsername = (username) => {
    if (!username || typeof username !== "string") return;
    socket.username = username;
    usersByName[username] = socket.id;
    usersById[socket.id] = username;
    console.log(`${username} registered with ID ${socket.id}`);
    io.to(socket.id).emit("registered", { username });
  };

  // Backwards-compatible: support both 'register' and 'login'
  socket.on("register", (username) => {
    attachUsername(username);
  });

  socket.on("login", ({ username }) => {
    attachUsername(username);
  });

  // Client can provide allowed recipient names (e.g., from Cside.jsx list)
  socket.on("set_recipients", (names) => {
    if (Array.isArray(names)) {
      recipientsBySocket[socket.id] = names.filter((n) => typeof n === "string");
      io.to(socket.id).emit("recipients_set", { names: recipientsBySocket[socket.id] });
    }
  });

  socket.on("private_message", ({ sender, receiver, message }) => {
    // Ensure sender is the logged-in user for this socket
    const effectiveSender = usersById[socket.id] || sender;

    // If recipients list was provided by this client, validate against it
    const allowedRecipients = recipientsBySocket[socket.id];
    if (Array.isArray(allowedRecipients) && receiver && !allowedRecipients.includes(receiver)) {
      io.to(socket.id).emit("error", { message: `Receiver '${receiver}' not in allowed recipients.` });
      return;
    }

    const receiverId = usersByName[receiver];
    if (receiverId) {
      io.to(receiverId).emit("private_message", { sender: effectiveSender, message });
    } else {
      io.to(socket.id).emit("error", { message: `User '${receiver}' is not online or not registered.` });
    }
  });

  socket.on("disconnect", () => {
    const username = usersById[socket.id];
    if (username) {
      delete usersByName[username];
    }
    delete usersById[socket.id];
    delete recipientsBySocket[socket.id];
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});
