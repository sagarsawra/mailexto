const { Queue } = require("bullmq");
const { createRedisConnection } = require("../config/redis");

let emailQueue;

const getEmailQueue = () => {
  if (!emailQueue) {
    emailQueue = new Queue("email-processing", {
      connection: createRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
      },
    });
    console.log("[queue] email-processing queue initialised");
  }
  return emailQueue;
};

module.exports = { getEmailQueue };
