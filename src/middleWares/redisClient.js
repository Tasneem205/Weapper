import { Redis } from "@upstash/redis";

const redisClient = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
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