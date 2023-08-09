const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
let users = [];

io.on("connection", (socket) => {
  socket.emit("welcome", "Welcome to the server");

  socket.on("create-room", ({username, roomId}) => {
    users.push({username,admin: true, roomId})
    socket.join(roomId);
    console.log(`User joined ${roomId}`);
    socket.emit("room-created", roomId);
    socket.to(roomId).emit("user-joined", username);
  });

  socket.on("join-room", ({username, roomId}) => {
    if(!users.find(user => user.roomId === roomId)) return socket.emit("room-not-found", roomId);
    users.push({username, roomId})
    socket.join(roomId);
    console.log(`User joined ${roomId}`);
    socket.emit("room-joined", roomId);
    socket.to(roomId).emit("user-joined", username);
  });

  socket.on("leave-room", ({username, roomId}) => {
    users = users.filter(user => user.username !== username)

    socket.leave(roomId)
    console.log(`User left ${roomId}`);
    socket.to(roomId).emit("user-left", username);
  });

  socket.on("send-message", ({username, roomId, msg}) => {
    socket.to(roomId).emit("message", {username, msg});
  }
  );

});

setInterval(() => {
  console.log(users);
}, 10000);

server.listen(8000, () => {
  console.log("Server is running on port : 8000");
});
