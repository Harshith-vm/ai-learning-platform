// Content script for AI Learning Assistant
// Task 64: Capture selected text from web pages

console.log('🔌 AI Learning Assistant content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('📨 Message received in content script:', request);

  if (request.action === 'getSelectedText') {
    try {
      // Get the selected text from the page
      const selectedText = window.getSelection().toString();
      
      console.log('📝 Selected text:', selectedText);
      console.log('📏 Length:', selectedText.length, 'characters');

      // Send the selected text back to the popup
      sendResponse({
        success: true,
        selectedText: selectedText,
        length: selectedText.length,
        timestamp: new Date().toISOString()
      });

      // Log success
      if (selectedText && selectedText.trim() !== '') {
        console.log('✅ Text successfully captured and sent to popup');
      } else {
        console.warn('⚠️ No text was selected');
      }

    } catch (error) {
      console.error('❌ Error capturing selected text:', error);
      sendResponse({
        success: false,
        error: error.message,
        selectedText: ''
      });
    }

    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

// Optional: Add visual feedback when text is selected
document.addEventListener('mouseup', function() {
  const selection = window.getSelection().toString();
  if (selection && selection.trim() !== '') {
    console.log('🖱️ Text selected on page:', selection.substring(0, 50) + '...');
  }
});

// Log when the content script is ready
console.log('✅ Content script ready to capture text selections');
