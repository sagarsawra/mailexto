const Email = require("../models/Email");
const User = require("../models/User");
const { fetchRecentEmails } = require("../services/gmailService");
const { enqueueEmailProcessing } = require("../services/queueService");

// GET /api/emails
const getEmails = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const limit = parseInt(req.query.limit) || 20; // ⭐ NEW

    const filter = userId ? { userId } : {};

    const emails = await Email.find(filter)
      .sort({ receivedAt: -1 })
      .limit(limit)
      .select("subject sender snippet receivedAt important processed")
      .lean();

    res.json(emails);
  } catch (err) {
    console.error("[emailController:getEmails]", {
      error: err.message,
      userId: req.query.userId,
    });
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

    // ⭐ FIX N+1 QUERY (IMPORTANT)
    const existingIds = new Set(
      (
        await Email.find({
          gmailMessageId: { $in: rawEmails.map(e => e.gmailMessageId) }
        }).select("gmailMessageId")
      ).map(e => e.gmailMessageId)
    );

    let newCount = 0;
    const jobs = [];

    for (const raw of rawEmails) {
      if (existingIds.has(raw.gmailMessageId)) continue;

      const email = await Email.create({ ...raw, userId: user._id });

      let jobId = null;

      try {
        jobId = await enqueueEmailProcessing(email._id, user._id);
      } catch (err) {
        console.error("[Queue Error]", {
          emailId: email._id,
          error: err.message,
        });
      }

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
    console.error("[emailController:syncEmails]", {
      error: err.message,
      userId: req.body.userId,
    });
    next(err);
  }
};

module.exports = { getEmails, syncEmails };