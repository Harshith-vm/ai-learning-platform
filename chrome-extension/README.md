# AI Learning Assistant - Chrome Extension

## Task 64: Basic Chrome Extension Structure

This is the foundational Chrome Extension for the AI Learning Platform. It captures selected text from web pages and will later send it to the AI backend for summarization.

## Current Features (Task 64)

- ✅ Manifest V3 compliant
- ✅ Captures selected text from any webpage
- ✅ Clean popup UI with instructions
- ✅ Console logging for debugging
- ✅ Confirmation alerts
- ✅ Background service worker
- ✅ Content script injection

## Project Structure

```
chrome-extension/
│
├── manifest.json       # Extension configuration (Manifest V3)
├── popup.html          # Popup UI
├── popup.js            # Popup logic
├── content.js          # Content script (runs on web pages)
├── background.js       # Background service worker
├── icons/              # Extension icons (placeholder)
└── README.md           # This file
```

## Installation Instructions

### 1. Enable Developer Mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **Developer mode** (top right corner)

### 2. Load the Extension

1. Click **Load unpacked**
2. Navigate to the `chrome-extension` folder in your project
3. Select the folder and click **Select Folder**

### 3. Verify Installation

- The extension icon should appear in your Chrome toolbar
- Check the console for: `✅ AI Learning Assistant background service worker loaded`

## How to Use (Task 64)

1. **Navigate to any webpage**
2. **Highlight/select some text** on the page
3. **Click the extension icon** in the toolbar
4. **Click "Summarize Selection"** button
5. **Check the results**:
   - Console logs will show the captured text
   - An alert will confirm the text was captured
   - The popup will show a success message

## Console Logs

The extension provides detailed console logging:

### Background Console (`chrome://extensions/` → Details → Inspect views: service worker)
```
✅ AI Learning Assistant background service worker loaded
📦 Extension version: 1.0.0
🎯 Ready to capture and process text selections
```

### Page Console (F12 on any webpage)
```
🔌 AI Learning Assistant content script loaded
✅ Content script ready to capture text selections
🖱️ Text selected on page: ...
📝 Selected text: ...
✅ Text successfully captured and sent to popup
```

### Popup Console (Right-click extension icon → Inspect popup)
```
🎨 AI Learning Assistant popup loaded
✅ Selected text captured: ...
📊 Text length: X characters
```

## Permissions

The extension requires:

- **activeTab**: Access to the currently active tab
- **scripting**: Inject content scripts
- **host_permissions**: Run on all URLs (`<all_urls>`)

## What's NOT Implemented Yet

The following features will be added in future tasks:

- ❌ API calls to backend
- ❌ AI summarization
- ❌ Text storage
- ❌ User authentication
- ❌ Settings/options page
- ❌ History of summaries

These will be implemented in **Task 65** and beyond.

## Testing Checklist

- [ ] Extension loads without errors
- [ ] Extension icon appears in Chrome toolbar
- [ ] Popup opens when clicking the icon
- [ ] Popup UI displays correctly (280px width)
- [ ] Can select text on any webpage
- [ ] Clicking "Summarize Selection" captures the text
- [ ] Console logs show the captured text
- [ ] Alert confirmation appears
- [ ] Success message shows in popup
- [ ] Works on multiple websites
- [ ] Content script loads on page refresh

## Troubleshooting

### Extension doesn't load
- Check `chrome://extensions/` for errors
- Ensure all files are in the correct location
- Verify manifest.json syntax

### No text captured
- Make sure text is actually selected (highlighted)
- Refresh the webpage and try again
- Check the page console for content script errors

### Popup doesn't open
- Check if the extension is enabled
- Look for errors in the extension details page
- Try reloading the extension

### Content script not working
- Refresh the webpage after installing the extension
- Check if the page allows content scripts (some pages block them)
- Verify in the page console that the content script loaded

## Development Notes

### Manifest V3 Changes

This extension uses Manifest V3, which has key differences from V2:

- **Service Worker** instead of background pages
- **Promises** instead of callbacks (where possible)
- **host_permissions** separate from permissions
- **action** instead of browser_action

### File Descriptions

**manifest.json**
- Extension configuration
- Defines permissions, scripts, and metadata

**popup.html**
- User interface for the extension popup
- Clean, modern design with gradient background
- 280px width for optimal display

**popup.js**
- Handles button clicks
- Communicates with content script
- Shows status messages and alerts

**content.js**
- Runs on every webpage
- Captures selected text using `window.getSelection()`
- Sends text back to popup

**background.js**
- Service worker that runs in the background
- Logs extension lifecycle events
- Will handle API calls in future tasks

## Next Steps (Task 65)

1. Add API endpoint configuration
2. Implement backend communication
3. Send captured text to FastAPI backend
4. Receive and display AI summary
5. Add loading states
6. Handle errors gracefully

## Version History

- **v1.0.0** (Task 64) - Basic text capture functionality

## License

Part of the AI Learning Platform project.
