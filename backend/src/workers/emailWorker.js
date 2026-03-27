/**
 * emailWorker.js — Run as a separate process: `node src/workers/emailWorker.js`
 * Processes emails from the queue: extracts events, marks emails as processed.
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });

const { Worker } = require("bullmq");
const mongoose = require("mongoose");
const { createRedisConnection, connectRedis } = require("../config/redis");
const { connectDB } = require("../config/db");
const Email = require("../models/Email");
const Event = require("../models/Event");
const { extractEventsFromEmail, isImportantEmail } = require("../services/aiService");

const processEmail = async (job) => {
  const { emailId, userId } = job.data;

  const email = await Email.findById(emailId);
  if (!email) {
    console.warn(`[worker] Email ${emailId} not found, skipping.`);
    return;
  }
  if (email.processed) {
    console.log(`[worker] Email ${emailId} already processed.`);
    return;
  }

  await job.updateProgress(20);

  // Mark important flag
  email.important = isImportantEmail(email.subject, email.body || email.snippet);
  await job.updateProgress(40);

  // Extract events via AI (FIXED: added await + safe handling)
  let extractedEvents = [];
  try {
    extractedEvents = await extractEventsFromEmail(email);
  } catch (err) {
    console.error(`[worker] AI extraction failed for email ${emailId}:`, err.message);
  }

  await job.updateProgress(70);

  // Persist events
  if (extractedEvents.length > 0) {
    const eventDocs = extractedEvents.map((ev) => ({
      ...ev,
      userId,
      emailId: email._id,
    }));
    await Event.insertMany(eventDocs, { ordered: false });
    console.log(`[worker] Stored ${eventDocs.length} event(s) from email ${emailId}`);
  }

  email.processed = true;
  await email.save();
  await job.updateProgress(100);

  console.log(`[worker] Completed job ${job.id} for email ${emailId}`);
};

(async () => {
  await connectDB();
  await connectRedis();

  const worker = new Worker("email-processing", processEmail, {
    connection: createRedisConnection(),
    concurrency: 5,
  });

  worker.on("completed", (job) =>
    console.log(`[worker] Job ${job.id} completed`)
  );

  worker.on("failed", (job, err) =>
    console.error(`[worker] Job ${job?.id} failed: ${err.message}`)
  );

  worker.on("error", (err) =>
    console.error("[worker] Worker error:", err.message)
  );

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`[worker] ${signal} received — shutting down gracefully`);
    await worker.close();
    await mongoose.disconnect();
    process.exit(0);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  console.log("[worker] emailWorker started, waiting for jobs...");
})();