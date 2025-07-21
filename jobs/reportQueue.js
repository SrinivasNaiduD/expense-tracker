
const reportQueue = require("../config/redis");

reportQueue.process(async (job) => {
  console.log(`Simulated: Email sent to ${job.data.email}`);
});

module.exports = reportQueue;