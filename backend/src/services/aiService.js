const axios = require("axios");

// 🔥 AI SERVICE URL
const AI_URL = "http://localhost:8001/extract";

/**
 * NEW: Call Python AI service
 */
const callAIService = async (text) => {
  try {
    const response = await axios.post(AI_URL, { text });
    return response.data;
  } catch (error) {
    console.error("AI service failed, using fallback:", error.message);
    return null;
  }
};


/**
 * Simulated AI service — uses regex heuristics to extract events from email text.
 * Replace the internals with a real LLM call (OpenAI, Gemini, etc.) in production.
 */

const DATE_PATTERNS = [
  /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/,
  /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{0,4}\b/i,
  /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/i,
  /\btomorrow\b/i,
  /\btoday\b/i,
];

const TIME_PATTERNS = [
  /\b(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\b/,
  /\b(\d{1,2}\s*(?:AM|PM|am|pm))\b/,
];

const LOCATION_PATTERNS = [
  /(?:at|@|in|location[:\s]+|venue[:\s]+)\s+([A-Z][a-zA-Z\s,]{3,40})/,
  /(?:zoom|meet|teams|google meet|webex)\s+(?:link|call|meeting)?[:\s]*(https?:\/\/\S+)?/i,
];

const EVENT_KEYWORDS = [
  "meeting", "call", "interview", "standup", "sync", "demo", "review",
  "deadline", "due", "submit", "launch", "event", "conference", "webinar",
  "workshop", "presentation", "appointment",
];

const HIGH_PRIORITY_KEYWORDS = ["urgent", "asap", "immediately", "critical", "deadline"];
const IMPORTANT_KEYWORDS = ["important", "action required", "follow up", "reminder"];

const extractDate = (text) => {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
};

const extractTime = (text) => {
  for (const pattern of TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
};

const extractLocation = (text) => {
  for (const pattern of LOCATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[1] || match[0];
  }
  return null;
};

const detectPriority = (text) => {
  const lower = text.toLowerCase();
  if (HIGH_PRIORITY_KEYWORDS.some((k) => lower.includes(k))) return "high";
  if (IMPORTANT_KEYWORDS.some((k) => lower.includes(k))) return "medium";
  return "low";
};

const isImportantEmail = (subject, body) => {
  const combined = `${subject} ${body}`.toLowerCase();
  return (
    HIGH_PRIORITY_KEYWORDS.some((k) => combined.includes(k)) ||
    IMPORTANT_KEYWORDS.some((k) => combined.includes(k))
  );
};

/**
 * 🔥 UPDATED FUNCTION (AI + fallback)
 */
const extractEventsFromEmail = async (email) => {
  const text = `${email.subject} ${email.body || email.snippet}`;

  // 🧠 TRY AI FIRST
  const aiResult = await callAIService(text);

  if (aiResult && aiResult.is_event) {
    return [
      {
        title: aiResult.title,
        datetime: aiResult.date && aiResult.time
          ? new Date(`${aiResult.date} ${aiResult.time}`)
          : null,
        location: aiResult.location || null,
        priority: "medium",
        rawText: text.slice(0, 500),
      },
    ];
  }

  // 🔁 FALLBACK TO ORIGINAL LOGIC (UNCHANGED)
  const lower = text.toLowerCase();

  const hasEventKeyword = EVENT_KEYWORDS.some((k) => lower.includes(k));
  if (!hasEventKeyword) return [];

  const dateStr = extractDate(text);
  const timeStr = extractTime(text);
  const location = extractLocation(text);
  const priority = detectPriority(text);

  let datetime = null;
  if (dateStr) {
    const combined = timeStr ? `${dateStr} ${timeStr}` : dateStr;
    const parsed = new Date(combined);
    datetime = isNaN(parsed.getTime()) ? null : parsed;
  }

  const matchedKeyword = EVENT_KEYWORDS.find((k) => lower.includes(k));
  const title = `${email.subject.slice(0, 60)}` || `${matchedKeyword} detected`;

  return [
    {
      title,
      datetime,
      location: location || null,
      priority,
      rawText: text.slice(0, 500),
    },
  ];
};

module.exports = { extractEventsFromEmail, isImportantEmail };