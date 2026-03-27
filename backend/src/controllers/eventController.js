const Event = require("../models/Event");

// GET /api/events
const getEvents = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};

    const events = await Event.find(filter)
      .sort({ datetime: 1 })
      .limit(20)
      .select("title datetime location priority")
      .lean();

    res.json(events);
  } catch (err) {
    next(err);
  }
};

module.exports = { getEvents };
