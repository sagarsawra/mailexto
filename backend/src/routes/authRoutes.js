const express = require("express");
const router = express.Router();
const { googleAuthRedirect, googleAuthCallback } = require("../controllers/authController");

router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);

module.exports = router;
