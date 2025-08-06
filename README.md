# Wageless

Wageless is a lightweight browser extension that monitors Amazon job listings and notifies you via Discord webhook the moment jobs become available.

## Features

* Detects Amazon job availability in real time
* Sends job count updates via Discord webhooks
* Auto-reloads and continues watching for new opportunities
* Clean, minimal code with configurable settings

## Installation

1. Download or clone this repo.
2. In your browser, go to `chrome://extensions/` or `about:debugging#/runtime/this-firefox`.
3. Enable Developer Mode.
4. Click “Load unpacked” (Chrome) or “Load Temporary Add-on” (Firefox).
5. Select the folder containing the extension files.
6. Add your [Discord webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) URL in `content.js`.

## Configuration

In `content.js`, set your webhook and (optionally) who to ping:

```js
const CONFIG = {
  WEBHOOK_URL: "YOUR_DISCORD_WEBHOOK_HERE",

  // Optional: who to ping in Discord
  MENTIONS: {
    enable: true,        // master toggle for pings
    everyone: false,     // set true to allow @everyone/@here
    userIds: [],         // e.g., ["123456789012345678"]
    roleIds: []          // e.g., ["987654321098765432"]
  }
};
```

> New to webhooks? See Discord’s guide: [https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks)

### How to get Discord IDs (users or roles)

1. **Enable Developer Mode** in Discord:
   **User Settings → Advanced → Developer Mode** (toggle on).

2. **Copy a User ID**:
   Right-click the user → **Copy ID** → add that string to `CONFIG.MENTIONS.userIds`.

3. **Copy a Role ID**:
   In a server where you have permission, open **Server Settings → Roles**, right-click the role → **Copy ID** → add to `CONFIG.MENTIONS.roleIds`.

4. **@everyone / @here**:
   Set `CONFIG.MENTIONS.everyone = true`.
   (The extension includes `allowed_mentions` so only your chosen mentions will ping.)

## License

MIT License — free to use, modify, or distribute. Credit is appreciated.  
Made by [anromerk](https://github.com/anromerk)  
Join the community: [Discord](https://discord.gg/9BurquCF)

