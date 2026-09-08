# 🤖 Autonomous QA Agent

> A Chrome extension that uses Google Gemini AI to autonomously navigate and complete data-entry tasks on dynamic web applications.

## ✨ Features

- **AI-Powered Decision Making** — Uses Gemini 1.5 Flash to intelligently select the most logical option from presented choices
- **Autonomous Navigation** — Detects quiz/MCQ modules and pending tasks automatically via DOM observation
- **Smart Matching** — Fuzzy matching fallback when exact match fails between AI response and DOM elements
- **Dashboard Awareness** — Monitors dashboard for incomplete modules (red/yellow indicators) and auto-navigates to them
- **Configurable Selectors** — Easily adaptable to different web applications by updating CSS selectors

## 🛠️ Tech Stack

- **Chrome Extension** — Manifest V3
- **AI** — Google Gemini 1.5 Flash API
- **Core** — Vanilla JavaScript (Content Script + Service Worker)

## 📦 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/vardaan03/autonomous-qa-agent.git
   ```
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder
5. Configure your Gemini API key in `background.js` or via extension storage

## ⚙️ Configuration

Update the CSS selectors in `content.js` to match your target web application:

```javascript
const SELECTORS = {
  PROMPT_TEXT: 'YOUR_QUESTION_SELECTOR',
  OPTION_LABELS: 'YOUR_OPTIONS_SELECTOR',
  SUBMIT_BUTTON: 'YOUR_SUBMIT_SELECTOR',
  UNFINISHED_MODULES: 'YOUR_RED_OR_YELLOW_SEGMENT_SELECTOR'
};
```

## 🔑 API Key Setup

Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) and either:
- Hardcode it in `background.js` (for testing)
- Store it via `chrome.storage.local` (recommended)

## 📁 Project Structure

```
├── manifest.json      # Extension manifest (MV3)
├── background.js      # Service worker — handles Gemini API calls
├── content.js         # Content script — DOM observation & interaction
└── README.md
```

## ⚠️ Disclaimer

This tool is intended for **educational and testing purposes only**. Use responsibly and in compliance with the target application's terms of service.

## 📄 License

MIT
