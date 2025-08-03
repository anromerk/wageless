// wageless - content.js

// ========== Configuration ==========
const CONFIG = {
  WEBHOOK_URL: "YOUR_DISCORD_WEBHOOK_URL_HERE",
  JOBS_URL: "https://hiring.amazon.com/app#/jobSearch",
  COUNT_SELECTOR: ".hvh-careers-emotion-tbniyc",
  NO_JOBS_SELECTOR: ".hvh-careers-emotion-4xlseg > b",
  CHECK_INTERVAL: 10000
};

// ========== Helpers ==========
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function parseJobCount() {
  const el = document.querySelector(CONFIG.COUNT_SELECTOR);
  if (!el) return null;
  const text = el.textContent || "";
  const match = text.match(/Total\s+(\d+)\s+jobs\s+found/i);
  return match ? parseInt(match[1], 10) : null;
}

function hasNoJobsBanner() {
  const b = document.querySelector(CONFIG.NO_JOBS_SELECTOR);
  return !!(b && /Sorry,\s*there are no jobs available/i.test(b.textContent || ""));
}

function notifyDiscord(message) {
  chrome.runtime.sendMessage({
    type: "discord_notify",
    message,
    webhook: CONFIG.WEBHOOK_URL
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
        console.log(`Initial count: ${count}`);
        sessionStorage.setItem("wageless_lastCount", count);
        notifyDiscord(`Watcher started: ${count} jobs found – ${CONFIG.JOBS_URL}`);
      } else if (count !== lastCount) {
        console.log(`Job count changed: ${lastCount} → ${count}`);
        lastCount = count;
        sessionStorage.setItem("wageless_lastCount", count);
        notifyDiscord(`Job count changed: ${count} jobs – ${CONFIG.JOBS_URL}`);
      } else {
        console.log(`No change. Still ${count} jobs.`);
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
