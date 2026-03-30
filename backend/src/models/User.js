const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, unique: true }, // ⭐ ADD THIS

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    accessToken: { type: String, default: null },
    refreshToken: { type: String, default: null },
    tokenExpiry: { type: Date },

    lastSyncAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);