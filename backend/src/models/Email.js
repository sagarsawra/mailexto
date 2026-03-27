const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gmailMessageId: { type: String, required: true, unique: true },
    subject: { type: String, default: "(no subject)" },
    sender: { type: String },
    snippet: { type: String },
    body: { type: String },
    receivedAt: { type: Date },
    important: { type: Boolean, default: false },
    processed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Email", emailSchema);
