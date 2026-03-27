const { createOAuth2Client, SCOPES } = require("../config/google");
const { google } = require("googleapis");
const User = require("../models/User");

// GET /api/auth/google
const googleAuthRedirect = (_req, res) => {
  const auth = createOAuth2Client();
  const url = auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });
  res.redirect(url);
};

// GET /api/auth/google/callback
const googleAuthCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: "Authorization code missing" });

    const auth = createOAuth2Client();
    const { tokens } = await auth.getToken(code);
    auth.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: "v2", auth });
    const { data } = await oauth2.userinfo.get();

    // Upsert user
    const user = await User.findOneAndUpdate(
      { email: data.email },
      {
        email: data.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // In production: issue a JWT or session cookie here
    res.json({ message: "Authenticated", userId: user._id, email: user.email });
  } catch (err) {
    next(err);
  }
};

module.exports = { googleAuthRedirect, googleAuthCallback };
