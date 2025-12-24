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
  // if (redisListenerRegistered) {
  //   return;
  // }

  // redisSubscriber.on("pmessage", (_pattern, channel, message) => {
  //   if (!ioInstance) {
  //     return;
  //   }

  //   try {
  //     const payload = JSON.parse(message);
  //     console.log(`🔔 Broadcasting Redis event: ${channel}`);
  //     ioInstance.emit(channel, payload);
  //   } catch (error) {
  //     console.error(`Failed to parse Redis message on ${channel}:`, error.message);
  //     ioInstance.emit(channel, message);
  //   }
  // });

  // // Subscribe to both task and ticket patterns
  // redisSubscriber.psubscribe("task:*", (error) => {
  //   if (error) {
  //     console.error("Failed to subscribe Redis pattern task:*:", error.message);
  //   } else {
  //     console.log("📡 Redis subscriber listening on task:* channels");
  //   }
  // });

  // redisSubscriber.psubscribe("ticket:*", (error) => {
  //   if (error) {
  //     console.error("Failed to subscribe Redis pattern ticket:*:", error.message);
  //   } else {
  //     console.log("📡 Redis subscriber listening on ticket:* channels");
    


  // // redisSubscriber.psubscribe("notification:*", (error) => {
  //   if (error) {
  //     console.error("Failed to subscribe Redis pattern notification:*:", error.message);
  //   } else {
  //     console.log("📡 Redis subscriber listening on notification:* channels");
  //   }
  // });

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

    // Join default workspace room
    socket.join("workspace");

    socket.on("join-room", (room) => {
      if (room) {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      }
    });

    socket.on("leave-room", (room) => {
      if (room) {
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
      }
    });

    // Join user-specific room if authenticated
    socket.on("authenticate", (data) => {
      if (data.userId) {
        socket.join(`user:${data.userId}`);
        socket.userId = data.userId;
        console.log(`Socket ${socket.id} authenticated for user: ${data.userId}`);
      }
    });

    // Join ticket-specific room
    socket.on("join-ticket", (ticketId) => {
      if (ticketId) {
        socket.join(`ticket:${ticketId}`);
        console.log(`Socket ${socket.id} joined ticket: ${ticketId}`);
      }
    });

    socket.on("leave-ticket", (ticketId) => {
      if (ticketId) {
        socket.leave(`ticket:${ticketId}`);
        console.log(`Socket ${socket.id} left ticket: ${ticketId}`);
      }
    });

    // Join task-specific room
    socket.on("join-task", (taskId) => {
      if (taskId) {
        socket.join(`task:${taskId}`);
        console.log(`Socket ${socket.id} joined task: ${taskId}`);
      }
    });

    socket.on("leave-task", (taskId) => {
      if (taskId) {
        socket.leave(`task:${taskId}`);
        console.log(`Socket ${socket.id} left task: ${taskId}`);
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
    console.warn("⚠️ Socket.io not initialized, skipping emit:", event);
    return;
  }

  ioInstance.emit(event, payload);
  console.log(`📡 Socket emit to all: ${event}`);
};

// Utility functions for targeted emissions
export const emitToRoom = (room, event, data) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.io not initialized, skipping room emit:", event);
    return;
  }

  ioInstance.to(room).emit(event, data);
  console.log(`📡 Socket emit to room '${room}': ${event}`);
};

export const emitToUser = (userId, event, data) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.io not initialized, skipping user emit:", event);
    return;
  }

  ioInstance.to(`user:${userId}`).emit(event, data);
  console.log(`📡 Socket emit to user '${userId}': ${event}`);
};

export const emitToTicket = (ticketId, event, data) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.io not initialized, skipping ticket emit:", event);
    return;
  }

  ioInstance.to(`ticket:${ticketId}`).emit(event, data);
  console.log(`📡 Socket emit to ticket '${ticketId}': ${event}`);
};

export const emitToTask = (taskId, event, data) => {
  if (!ioInstance) {
    console.warn("⚠️ Socket.io not initialized, skipping task emit:", event);
    return;
  }

  ioInstance.to(`task:${taskId}`).emit(event, data);
  console.log(`📡 Socket emit to task '${taskId}': ${event}`);
};