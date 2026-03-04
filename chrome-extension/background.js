// Background service worker for AI Learning Assistant
// Task 64: Basic extension initialization

// Log when the extension is installed
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('🚀 AI Learning Assistant installed');
  console.log('📋 Install details:', details);
  
  if (details.reason === 'install') {
    console.log('✨ First time installation');
  } else if (details.reason === 'update') {
    console.log('🔄 Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Log when the extension starts up
chrome.runtime.onStartup.addListener(function() {
  console.log('🔌 AI Learning Assistant started');
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('📨 Background received message:', request);
  console.log('📤 From:', sender);
  
  // Handle different message types here in future tasks
  // For Task 64, we just log the messages
  
  return true; // Keep the message channel open for async responses
});

// Log when the service worker is activated
console.log('✅ AI Learning Assistant background service worker loaded');
console.log('📦 Extension version:', chrome.runtime.getManifest().version);
console.log('🎯 Ready to capture and process text selections');
