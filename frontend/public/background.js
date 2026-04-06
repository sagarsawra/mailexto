// background.js — Service Worker (MV3)

chrome.runtime.onInstalled.addListener(() => {
  console.log("Inbox Intelligence installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SYNC_REQUEST") {
    const userId = message.userId || "";
    fetch("http://localhost:5000/api/emails/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // keep channel open for async response
  }
});
