const { google } = require("googleapis");
const { createOAuth2Client } = require("../config/google");

const buildAuthClient = (user) => {
  const auth = createOAuth2Client();
  auth.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
    expiry_date: user.tokenExpiry ? new Date(user.tokenExpiry).getTime() : null,
  });
  return auth;
};

const decodeBase64 = (data) =>
  Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");

const extractBody = (payload) => {
  if (!payload) return "";
  if (payload.body && payload.body.data) return decodeBase64(payload.body.data);
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain" && part.body && part.body.data)
        return decodeBase64(part.body.data);
    }
    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }
  return "";
};

const extractHeader = (headers, name) =>
  (headers.find((h) => h.name.toLowerCase() === name.toLowerCase()) || {}).value || "";

const fetchRecentEmails = async (user, maxResults = 20) => {
  // 🔥 FALLBACK: If no OAuth tokens → return mock data
  if (!user.accessToken && !user.refreshToken) {
    console.warn("[gmailService] No OAuth tokens found — using mock emails");

    return [
      {
        gmailMessageId: "mock1",
        subject: "Meeting tomorrow at 5 PM",
        sender: "boss@company.com",
        snippet: "We have a meeting tomorrow at 5 PM in Mumbai office",
        body: "We have a meeting tomorrow at 5 PM in Mumbai office",
        receivedAt: new Date(),
      },
      {
        gmailMessageId: "mock2",
        subject: "Project deadline reminder",
        sender: "manager@company.com",
        snippet: "Deadline is March 25 at 11 AM",
        body: "Reminder: project deadline is March 25 at 11 AM",
        receivedAt: new Date(),
      },
    ];
  }

  // ✅ ORIGINAL LOGIC (UNCHANGED)
  const auth = buildAuthClient(user);
  const gmail = google.gmail({ version: "v1", auth });

  const listRes = await gmail.users.messages.list({
    userId: "me",
    maxResults,
    q: "is:inbox",
  });

  const messages = listRes.data.messages || [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id,
        format: "full",
      });

      const { payload, snippet, internalDate } = detail.data;
      const headers = payload.headers || [];

      return {
        gmailMessageId: msg.id,
        subject: extractHeader(headers, "Subject") || "(no subject)",
        sender: extractHeader(headers, "From"),
        snippet: snippet || "",
        body: extractBody(payload),
        receivedAt: internalDate ? new Date(parseInt(internalDate)) : new Date(),
      };
    })
  );

  return emails;
};

module.exports = { fetchRecentEmails };