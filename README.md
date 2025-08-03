# Wageless

Wageless is a lightweight browser extension that monitors Amazon job listings and notifies you via Discord webhook the moment jobs become available.

## Features

- Detects Amazon job availability in real time
- Sends job count updates via Discord webhooks
- Auto-reloads and continues watching for new opportunities
- Clean, minimal code with configurable settings

## Installation

1. Download or clone this repo.
2. In your browser, go to `chrome://extensions/` or `about:debugging#/runtime/this-firefox`.
3. Enable Developer Mode.
4. Click “Load unpacked” (Chrome) or “Load Temporary Add-on” (Firefox).
5. Select the folder containing the extension files.
6. Add your [Discord webhook](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) URL in `content.js`.

## Configuration

In `content.js`, change:

```js
const CONFIG = {
  WEBHOOK_URL: "YOUR_DISCORD_WEBHOOK_HERE"
};
```

## License

MIT License — free to use, modify, or distribute. Credit is appreciated.  
Made by [anromerk](https://github.com/anromerk)  
Join the community: [Discord](https://discord.gg/9BurquCF)
