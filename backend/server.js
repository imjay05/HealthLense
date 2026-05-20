require("dotenv").config();
const http       = require("http");
const { Server } = require("socket.io");
const app        = require("./app");
const connectDB  = require("./config/DB");
const { setupSocket } = require("./socket/SocketHandler");

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setupSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`
🚀 HealthLense Server running
   ├─ HTTP → http://localhost:${PORT}
   ├─ WS   → ws://localhost:${PORT}
   ├─ DB   → MongoDB Atlas
   └─ Health → http://localhost:${PORT}/health
    `);
  });
};

start().catch(err => {
  console.error("Server failed to start:", err);
  process.exit(1);
});