const Email = require("../models/Email");
const User = require("../models/User");
const { fetchRecentEmails } = require("../services/gmailService");
const { enqueueEmailProcessing } = require("../services/queueService");

// GET /api/emails
const getEmails = async (req, res, next) => {
  try {
    // In production, userId comes from authenticated session/JWT
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    const emails = await Email.find(filter)
      .sort({ receivedAt: -1 })
      .limit(20)
      .select("subject sender snippet receivedAt important processed")
      .lean();

    res.json(emails);
  } catch (err) {
    console.error("[emailController] getEmails error:", err.message);
    next(err);
  }
};

// POST /api/sync
const syncEmails = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch from Gmail
    const rawEmails = await fetchRecentEmails(user);

    // Upsert emails + enqueue for processing
    let newCount = 0;
    const jobs = [];

    for (const raw of rawEmails) {
      const exists = await Email.findOne({ gmailMessageId: raw.gmailMessageId });
      if (exists) continue;

      const email = await Email.create({ ...raw, userId: user._id });

      const jobId = await enqueueEmailProcessing(email._id, user._id);

      jobs.push({ emailId: email._id, jobId });
      newCount++;
    }

    // Update user's lastSyncAt
    user.lastSyncAt = new Date();
    await user.save();

    res.json({
      message: "Sync initiated",
      fetched: rawEmails.length,
      queued: newCount,
      jobs,
    });
  } catch (err) {
    console.error("[emailController] syncEmails error:", err.message);
    next(err);
  }
};

module.exports = { getEmails, syncEmails };