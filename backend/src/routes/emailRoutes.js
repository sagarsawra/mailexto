const express = require("express");
const router = express.Router();
const { getEmails, syncEmails } = require("../controllers/emailController");

// 👉 (Optional) later plug auth middleware here
// const auth = require("../middleware/auth");

// router.get("/", auth, getEmails);
// router.post("/sync", auth, syncEmails);

router.get("/", getEmails);
router.post("/sync", syncEmails);

module.exports = router;