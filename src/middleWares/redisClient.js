import redis from "redis";

const redisClient = redis.createClient({url: process.env.REDIS_URL});

await redisClient.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });

// function getOrSetCache(key, cb) {
//     return new Promise((resolve, reject) => {
//         redisClient.get(key, async (error, data) => {
//             if (error) return reject(error);
//             if (data != null) return resolve(JSON.parse(data));
//             const freshData = await cb();
//             redisClient.setex(key, 10, freshData);
//             resolve(JSON.stringify(freshData));
//         });
//     })
// }

export default redisClient;