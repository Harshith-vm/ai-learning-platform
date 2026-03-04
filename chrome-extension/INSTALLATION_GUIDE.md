# Installation & Testing Guide

## Prerequisites

- Google Chrome browser (version 88 or higher)
- Basic understanding of Chrome extensions
- The `chrome-extension` folder from this project

## Step-by-Step Installation

### 1. Prepare the Extension

Ensure you have all required files in the `chrome-extension` folder:

```
chrome-extension/
├── manifest.json       ✓
├── popup.html          ✓
├── popup.js            ✓
├── content.js          ✓
├── background.js       ✓
├── icons/              ✓
└── README.md           ✓
```

### 2. Create Icon Files (Temporary)

Before loading the extension, you need to create placeholder icons:

**Quick Method** (for testing):

1. Open any image editor or use an online tool
2. Create a simple 128x128 pixel image (any color/design)
3. Save it as `icon128.png` in the `icons/` folder
4. Resize and save as:
   - `icon16.png` (16x16)
   - `icon32.png` (32x32)
   - `icon48.png` (48x48)

**Alternative**: Use an emoji screenshot:
- Take a screenshot of 🤖 or 📚
- Crop to square
- Resize to required dimensions

### 3. Open Chrome Extensions Page

1. Open Google Chrome
2. Navigate to: `chrome://extensions/`
3. Or: Menu (⋮) → More Tools → Extensions

### 4. Enable Developer Mode

1. Look for the **Developer mode** toggle in the top-right corner
2. Click to enable it
3. You should see new buttons appear: "Load unpacked", "Pack extension", "Update"

### 5. Load the Extension

1. Click the **Load unpacked** button
2. Navigate to your project folder
3. Select the `chrome-extension` folder
4. Click **Select Folder** (or **Open** on Mac)

### 6. Verify Installation

You should see:

✅ **Extension card** appears with:
- Name: "AI Learning Assistant"
- Version: 1.0.0
- Description: "Capture and summarize selected text using AI"
- Status: Enabled (blue toggle)

✅ **Extension icon** appears in Chrome toolbar (top-right)
- If not visible, click the puzzle piece icon and pin it

✅ **No errors** in the extension card
- If there are errors, check the "Errors" button for details

## Testing the Extension

### Test 1: Background Service Worker

1. On the extension card, click **Details**
2. Scroll down to **Inspect views**
3. Click **service worker**
4. Check the console for:
   ```
   ✅ AI Learning Assistant background service worker loaded
   📦 Extension version: 1.0.0
   🎯 Ready to capture and process text selections
   ```

### Test 2: Content Script Loading

1. Open any webpage (e.g., https://example.com)
2. Open DevTools (F12 or Right-click → Inspect)
3. Check the Console tab for:
   ```
   🔌 AI Learning Assistant content script loaded
   ✅ Content script ready to capture text selections
   ```

### Test 3: Popup UI

1. Click the extension icon in the toolbar
2. Verify the popup opens
3. Check that it displays:
   - Title: "AI Learning Assistant"
   - Robot emoji: 🤖
   - Instructions
   - "Summarize Selection" button
   - Footer: "AI Learning Platform v1.0"

### Test 4: Text Selection & Capture

1. Go to any webpage with text (e.g., Wikipedia, news site)
2. **Highlight/select** some text (drag to select)
3. Click the extension icon
4. Click **"Summarize Selection"** button
5. Verify:
   - ✅ Button changes to "⏳ Capturing..."
   - ✅ Alert appears: "Selected text captured!"
   - ✅ Success message in popup
   - ✅ Console logs show the captured text

### Test 5: Console Logging

**Page Console** (F12 on the webpage):
```
📝 Selected text: [your selected text]
📏 Length: X characters
✅ Text successfully captured and sent to popup
```

**Popup Console** (Right-click extension icon → Inspect popup):
```
🎨 AI Learning Assistant popup loaded
✅ Selected text captured: [preview]
📊 Text length: X characters
```

### Test 6: Error Handling

**Test with no text selected**:
1. Don't select any text
2. Click extension icon
3. Click "Summarize Selection"
4. Should show: "No text selected. Please highlight some text first."

**Test on restricted pages**:
1. Try on `chrome://extensions/`
2. Extension won't work (expected - Chrome security)
3. Should show appropriate error message

## Common Issues & Solutions

### Issue: Extension doesn't appear

**Solution**:
- Refresh the extensions page
- Check if Developer mode is enabled
- Verify all files are in the correct folder
- Look for errors in the extension card

### Issue: Icons not showing

**Solution**:
- Create placeholder icon files (see step 2)
- Ensure icons are named correctly:
  - `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
- Reload the extension after adding icons

### Issue: Popup doesn't open

**Solution**:
- Check for JavaScript errors in popup console
- Verify `popup.html` and `popup.js` exist
- Reload the extension
- Try disabling and re-enabling the extension

### Issue: Content script not working

**Solution**:
- Refresh the webpage after installing extension
- Check page console for errors
- Verify the page allows content scripts
- Some pages (like chrome://) block extensions

### Issue: "No response from page" error

**Solution**:
- Refresh the webpage
- Check if content script loaded (see page console)
- Verify manifest.json has correct content_scripts configuration
- Try on a different website

### Issue: Selected text not captured

**Solution**:
- Make sure text is actually highlighted (blue background)
- Try selecting text again
- Check page console for errors
- Verify `window.getSelection()` works on that page

## Debugging Tips

### 1. Check All Consoles

There are THREE separate consoles:

1. **Background Console**: Extension details → Inspect views → service worker
2. **Page Console**: F12 on the webpage
3. **Popup Console**: Right-click extension icon → Inspect popup

### 2. Reload the Extension

After making changes:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the extension card
3. Refresh any open webpages

### 3. Check Manifest Errors

If the extension won't load:
1. Check `manifest.json` syntax (valid JSON)
2. Verify all file paths are correct
3. Ensure all required fields are present

### 4. View Extension Errors

On the extension card:
1. Click **Errors** button (if visible)
2. Review error messages
3. Click on error to see stack trace

## Testing Checklist

Use this checklist to verify everything works:

- [ ] Extension loads without errors
- [ ] Extension icon visible in toolbar
- [ ] Background service worker logs appear
- [ ] Content script loads on webpages
- [ ] Popup opens when clicking icon
- [ ] Popup UI displays correctly
- [ ] Can select text on webpage
- [ ] "Summarize Selection" button works
- [ ] Alert confirmation appears
- [ ] Success message shows in popup
- [ ] Console logs show captured text
- [ ] Error handling works (no text selected)
- [ ] Works on multiple different websites
- [ ] Extension persists after browser restart

## Next Steps

Once everything is working:

1. ✅ **Task 64 Complete** - Basic extension structure working
2. 🔜 **Task 65** - Add backend API integration
3. 🔜 **Task 66** - Implement AI summarization
4. 🔜 **Task 67** - Add storage and history

## Support

If you encounter issues:

1. Check the console logs (all three consoles)
2. Review the error messages
3. Verify all files are present and correct
4. Try reloading the extension
5. Test on a simple webpage first (like example.com)

## Development Workflow

For ongoing development:

1. Make changes to extension files
2. Go to `chrome://extensions/`
3. Click refresh icon on extension card
4. Refresh any open webpages
5. Test the changes
6. Check console logs for errors

## Production Deployment

For publishing to Chrome Web Store (future):

1. Create professional icons
2. Add detailed description
3. Create promotional images
4. Set up privacy policy
5. Submit for review

See: https://developer.chrome.com/docs/webstore/publish/

---

**Status**: Task 64 - Basic Extension Structure ✅
**Next**: Task 65 - Backend Integration 🔜
