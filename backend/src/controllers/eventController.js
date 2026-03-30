const Event = require("../models/Event");

// GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const limit = parseInt(req.query.limit) || 20; // ⭐ NEW

    const filter = userId ? { userId } : {};

    const events = await Event.find(filter)
      .sort({ datetime: 1 })
      .limit(limit)
      .select("title datetime location priority")
      .lean();

    res.json(events);
  } catch (err) {
    next(err);
  }
};

module.exports = { getEvents };