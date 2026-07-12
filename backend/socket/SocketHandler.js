const jwt = require("jsonwebtoken");
const { getNearbyLabs } = require("../services/OverPassService");

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token){
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: user ${socket.userId}`);

    socket.on("find:labs", async ({ lat, lon, radiusKm = 10 }) => {
      if (!lat || !lon) {
        return socket.emit("labs:error", { message: "Coordinates required" });
      }

      try {
        socket.emit("labs:loading", { message: "Searching nearby labs..." });

        const labs = await getNearbyLabs(
          parseFloat(lat),
          parseFloat(lon),
          Math.min(radiusKm, 25), 
          5
        );

        socket.emit("labs:result", { labs });
      } catch (err) {
        console.error("Overpass socket error:", err.message);
        socket.emit("labs:error", { message: "Could not fetch nearby labs" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: user ${socket.userId}`);
    });
  });
};


module.exports = { setupSocket };