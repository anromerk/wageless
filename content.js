// wageless - content.js

// ========== Configuration ==========
const CONFIG = {
  WEBHOOK_URL: "YOUR_DISCORD_WEBHOOK_URL_HERE",
  JOBS_URL: "https://hiring.amazon.com/app#/jobSearch",
  COUNT_SELECTOR: ".hvh-careers-emotion-tbniyc",
  NO_JOBS_SELECTOR: ".hvh-careers-emotion-4xlseg > b",
  CHECK_INTERVAL: 10000,
  // ---- Mentions config ----
  MENTIONS: {
    enable: true,       // master toggle
    everyone: false,    // true => allow @everyone/@here
    userIds: [],        // e.g., ["123456789012345678"]
    roleIds: []         // e.g., ["987654321098765432"]
  }
};

// ========== Helpers ==========
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function parseCountFromText(text) {
  if (!text) return null;

  const patterns = [
    /Total\s+([\d,]+)\s+jobs?\s+found/i,
    /Total\s*(?:of\s*)?([\d,]+)\s+jobs?\s+found/i,
    /([\d,]+)\s+jobs?\s+found/i,
    /Total\s+jobs?\s+found\s*[:\-]?\s*([\d,]+)/i
  ];

  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const num = parseInt((m[1] || "").replace(/,/g, ""), 10);
      if (Number.isFinite(num)) return num;
    }
  }
  return null;
}

function parseJobCount() {
  const el = document.querySelector(CONFIG.COUNT_SELECTOR);
  if (el) {
    const count = parseCountFromText(el.textContent || "");
    if (count !== null) return count;
  }

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const count = parseCountFromText(node.textContent || "");
    if (count !== null) return count;
  }

  return null;
}

function hasNoJobsBanner() {
  const b = document.querySelector(CONFIG.NO_JOBS_SELECTOR);
  return !!(b && /Sorry,\s*there are no jobs available/i.test(b.textContent || ""));
}

function buildMentionPrefix() {
  const tags = [];
  if (CONFIG.MENTIONS.everyone) tags.push("@everyone");
  for (const id of CONFIG.MENTIONS.userIds) tags.push(`<@${id}>`);
  for (const id of CONFIG.MENTIONS.roleIds) tags.push(`<@&${id}>`);
  return tags.length ? tags.join(" ") + " " : "";
}

function buildAllowedMentions() {
  return {
    parse: CONFIG.MENTIONS.everyone ? ["everyone"] : [],
    users: CONFIG.MENTIONS.userIds,
    roles: CONFIG.MENTIONS.roleIds
  };
}

function notifyDiscord(message) {
  const mentionPrefix = CONFIG.MENTIONS.enable ? buildMentionPrefix() : "";
  chrome.runtime.sendMessage({
    type: "discord_notify",
    webhook: CONFIG.WEBHOOK_URL,
    payload: {
      content: `${mentionPrefix}${message}`,
      allowed_mentions: CONFIG.MENTIONS.enable ? buildAllowedMentions() : { parse: [] }
    }
  });
}

// ========== Job Watcher ==========
function runWatcherLoop() {
  let lastCount = sessionStorage.getItem("wageless_lastCount");
  lastCount = lastCount !== null ? parseInt(lastCount, 10) : null;
  let attempt = 0;

  async function safeTick() {
    attempt++;
    console.log(`[Watcher] Attempt ${attempt}...`);

    const count = parseJobCount();

    if (count !== null) {
      if (lastCount === null) {
        lastCount = count;
        sessionStorage.setItem("wageless_lastCount", count);
        console.log(`Initial count: ${count}`);
        notifyDiscord(`Watcher started: ${count} job${count === 1 ? "" : "s"} found – ${CONFIG.JOBS_URL}`);
      } else if (count !== lastCount) {
        console.log(`Job count changed: ${lastCount} → ${count}`);
        lastCount = count;
        sessionStorage.setItem("wageless_lastCount", count);
        notifyDiscord(`Job count changed: ${count} job${count === 1 ? "" : "s"} – ${CONFIG.JOBS_URL}`);
      } else {
        console.log(`No change. Still ${count} job${count === 1 ? "" : "s"}.`);
      }
    } else if (hasNoJobsBanner()) {
      if (lastCount !== 0) {
        lastCount = 0;
        sessionStorage.setItem("wageless_lastCount", 0);
        console.log("No jobs banner detected.");
        notifyDiscord(`No jobs available – ${CONFIG.JOBS_URL}`);
      } else {
        console.log("Still 0 jobs.");
      }
    } else {
      console.log("Job count not found yet. Retrying...");
    }

    setTimeout(() => window.location.reload(), CONFIG.CHECK_INTERVAL);
  }

  setTimeout(safeTick, 2000);
}

// ========== Entry Point ==========
if (location.href.includes("/jobSearch")) {
  console.log("On jobSearch page – initializing watcher...");
  runWatcherLoop();
}
