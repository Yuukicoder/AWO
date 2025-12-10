import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const createClient = () =>
  new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
  });

export const redisPublisher = createClient();
export const redisSubscriber = createClient();

const isActiveStatus = (status) => ["connecting", "connect", "ready"].includes(status);

export const connectRedis = async () => {
  try {
    if (!isActiveStatus(redisPublisher.status)) {
      await redisPublisher.connect();
    }

    if (!isActiveStatus(redisSubscriber.status)) {
      await redisSubscriber.connect();
    }

    console.log("✅ Redis connected");
  } catch (error) {
    console.error("❌ Redis connection error:", error.message);
    throw error;
  }
};

const safeQuit = async (client) => {
  if (!client) {
    return;
  }

  const terminalStates = ["end", "close"];
  if (terminalStates.includes(client.status)) {
    return;
  }

  if (client.status === "wait") {
    client.disconnect(false);
    return;
  }

  try {
    await client.quit();
  } catch (error) {
    client.disconnect(false);
  }
};

export const disconnectRedis = async () => {
  try {
    await Promise.allSettled([safeQuit(redisPublisher), safeQuit(redisSubscriber)]);
    console.log("⚡ Redis connections closed");
  } catch (error) {
    console.error("Redis disconnect error:", error.message);
  }
};

export const publishEvent = async (channel, payload) => {
  try {
    const data = typeof payload === "string" ? payload : JSON.stringify(payload);
    await redisPublisher.publish(channel, data);
  } catch (error) {
    console.error(`Error publishing to channel ${channel}:`, error.message);
  }
};