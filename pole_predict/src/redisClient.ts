import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379", // adapte l'URL si nécessaire
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

export const initializeRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;
