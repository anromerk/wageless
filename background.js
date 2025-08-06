// wageless - background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type !== "discord_notify") return;

  const webhook =
    request.webhook ||
    (request.message && (request.message.webhook || request.message.url)) ||
    "";

  if (!webhook) {
    console.error("[Background] Missing webhook URL");
    if (sendResponse) sendResponse({ ok: false, error: "Missing webhook URL" });
    return; 
  }

  let payload;
  if (request.payload && typeof request.payload === "object") {
    payload = request.payload;
  } else if (typeof request.message === "string") {
    payload = { content: request.message, allowed_mentions: { parse: [] } };
  } else if (request.message && typeof request.message === "object") {
    const contentStr = request.message.content != null ? String(request.message.content) : "";
    payload = request.message.payload || { content: contentStr };
    if (!payload.allowed_mentions) payload.allowed_mentions = { parse: [] };
  } else {
    payload = { content: "", allowed_mentions: { parse: [] } };
  }

  fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => {
      console.log("[Background] Webhook sent:", res.status);
      if (sendResponse) sendResponse({ ok: true, status: res.status });
    })
    .catch((err) => {
      console.error("[Background] Failed to send webhook:", err);
      if (sendResponse) sendResponse({ ok: false, error: String(err) });
    });

  return true;
});
