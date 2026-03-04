// Popup script for AI Learning Assistant
// Task 64: Basic text capture functionality

document.addEventListener('DOMContentLoaded', function() {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const statusDiv = document.getElementById('status');

  // Handle summarize button click
  summarizeBtn.addEventListener('click', async function() {
    try {
      // Disable button during processing
      summarizeBtn.disabled = true;
      summarizeBtn.textContent = '⏳ Capturing...';
      
      // Clear previous status
      statusDiv.className = 'status';
      statusDiv.textContent = '';

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Send message to content script to get selected text
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'getSelectedText' },
        function(response) {
          // Re-enable button
          summarizeBtn.disabled = false;
          summarizeBtn.textContent = '📝 Summarize Selection';

          // Check for errors
          if (chrome.runtime.lastError) {
            console.error('Error:', chrome.runtime.lastError);
            showStatus('error', 'Failed to capture text. Please refresh the page and try again.');
            return;
          }

          // Check if we got a response
          if (!response) {
            showStatus('error', 'No response from page. Please refresh and try again.');
            return;
          }

          // Check if text was selected
          if (!response.selectedText || response.selectedText.trim() === '') {
            showStatus('error', 'No text selected. Please highlight some text first.');
            return;
          }

          // Success! Show the captured text
          console.log('✅ Selected text captured:', response.selectedText);
          console.log('📊 Text length:', response.selectedText.length, 'characters');
          
          // Show success message
          const textPreview = response.selectedText.substring(0, 50);
          const preview = response.selectedText.length > 50 
            ? textPreview + '...' 
            : textPreview;
          
          showStatus('success', `✓ Captured: "${preview}"`);

          // Show alert confirmation (as per Task 64 requirements)
          alert(`Selected text captured!\n\nLength: ${response.selectedText.length} characters\n\nPreview: ${preview}\n\nCheck the console for full text.`);
        }
      );

    } catch (error) {
      console.error('Error in popup:', error);
      summarizeBtn.disabled = false;
      summarizeBtn.textContent = '📝 Summarize Selection';
      showStatus('error', 'An error occurred: ' + error.message);
    }
  });

  // Helper function to show status messages
  function showStatus(type, message) {
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.className = 'status';
        statusDiv.textContent = '';
      }, 5000);
    }
  }

  // Log popup loaded
  console.log('🎨 AI Learning Assistant popup loaded');
});
