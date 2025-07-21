const Queue = require("bull");
const reportQueue = new Queue("weekly-report", process.env.REDIS_URL);
module.exports = reportQueue;
