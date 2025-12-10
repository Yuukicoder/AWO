import { Server } from "socket.io";
import { redisSubscriber } from "./redis.js";

let ioInstance = null;
let redisListenerRegistered = false;

const getAllowedOrigins = () => {
  const rawOrigins = process.env.FRONTEND_URL || "";
  const origins = rawOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins.length ? origins : true;
};

const registerRedisListeners = () => {
  if (redisListenerRegistered) {
    return;
  }

  redisSubscriber.on("pmessage", (_pattern, channel, message) => {
    if (!ioInstance) {
      return;
    }

    try {
      const payload = JSON.parse(message);
      ioInstance.emit(channel, payload);
    } catch (error) {
      console.error(`Failed to parse Redis message on ${channel}:`, error.message);
      ioInstance.emit(channel, message);
    }
  });

  redisSubscriber.psubscribe("task:*", (error) => {
    if (error) {
      console.error("Failed to subscribe Redis pattern task:*:", error.message);
    } else {
      console.log("📡 Redis subscriber listening on task:* channels");
    }
  });

  redisListenerRegistered = true;
};

export const initSocket = (httpServer) => {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  ioInstance.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("join-room", (room) => {
      if (room) {
        socket.join(room);
      }
    });

    socket.on("leave-room", (room) => {
      if (room) {
        socket.leave(room);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", socket.id, reason);
    });
  });

  registerRedisListeners();

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io instance has not been initialized");
  }

  return ioInstance;
};

export const emitEvent = (event, payload) => {
  if (!ioInstance) {
    return;
  }

  ioInstance.emit(event, payload);
};