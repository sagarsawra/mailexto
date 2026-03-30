const express = require("express");
const router = express.Router();
const { getEvents } = require("../controllers/eventController");

// 👉 (Optional) later plug auth middleware
// const auth = require("../middleware/auth");
// router.get("/", auth, getEvents);

router.get("/", getEvents);

module.exports = router;