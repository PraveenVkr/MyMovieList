import Redis from "ioredis";

const redis = new Redis({
  host: "localhost",
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error:", err);
});

export default redis;
