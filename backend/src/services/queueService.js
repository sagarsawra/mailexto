const { getEmailQueue } = require("../queues/emailQueue");

const enqueueEmailProcessing = async (emailId, userId) => {
  try {
    const queue = getEmailQueue();

    const job = await queue.add(
      "process-email",
      { emailId: emailId.toString(), userId: userId.toString() },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
      }
    );

    console.log(`[queue] Job ${job.id} enqueued for email ${emailId}`);

    return job.id;
  } catch (err) {
    console.error("[queue] Failed to enqueue job:", err.message);
    throw err; // keep behavior same for controller handling
  }
};

module.exports = { enqueueEmailProcessing };