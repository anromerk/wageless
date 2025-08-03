// wageless - background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "discord_notify" && request.message) {
    fetch(request.message.url || request.message.webhook || request.webhook || "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: request.message }),
    })
      .then((res) => console.log("[Background] Webhook sent:", res.status))
      .catch((err) => console.error("[Background] Failed to send webhook:", err));
  }
});

