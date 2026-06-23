require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const connectDB  = require("./config/DB");
const { setupSocket } = require("./socket/SocketHandler");

const PORT = process.env.PORT || 5000;

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(o => o.trim())
  .filter(Boolean);

const start = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  const io = new Server(httpServer, {
    cors: {
      rigin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setupSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`
   HealthLense Server running
   ├─ HTTP  → http://localhost:${PORT}
   ├─ DB    → MongoDB Atlas
    `);
  });
};

start().catch(err => {
  console.error("Server failed to start:", err);
  process.exit(1);
});