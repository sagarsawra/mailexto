const IORedis = require("ioredis");

let redisClient;

const createRedisConnection = () =>
  new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

const connectRedis = async () => {
  redisClient = createRedisConnection();

  redisClient.on("connect", () =>
    console.log("[redis] Connected ✅")
  );

  redisClient.on("error", (err) =>
    console.error("[redis] Error:", err.message)
  );

  return redisClient;
};

const getRedisClient = () => {
  if (!redisClient)
    throw new Error("Redis not initialised. Call connectRedis() first.");
  return redisClient;
};

module.exports = { connectRedis, createRedisConnection, getRedisClient };