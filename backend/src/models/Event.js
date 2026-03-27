const mongoose = require("mongoose");

const PRIORITIES = ["low", "medium", "high"];

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    emailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Email",
    },
    title: { type: String, required: true },
    datetime: { type: Date },
    location: { type: String },
    priority: { type: String, enum: PRIORITIES, default: "medium" },
    rawText: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
