const redis = require("redis");

const client = redis.createClient({
  url: process.env.REDIS_URL,
  username: process.env.REDIS_USER,
  password: process.env.REDIS_PWD,
});

module.exports = client;
