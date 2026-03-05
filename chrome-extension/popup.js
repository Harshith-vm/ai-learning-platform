// Popup script for AI Learning Assistant
// Task 65: Selected Text Summarization
// Task 65A: Summarize Entire Page
// Task 66: Improved Popup UI
// Task 65B-65K: Unified Code Tools System

const API_BASE_URL = 'http://127.0.0.1:8000';
const MAX_TEXT_LENGTH = 10000; // Limit text to prevent large payloads

// Code Tools Actions
const CODE_TOOLS = {
  EXPLAIN: 'explain',
  REFACTOR: 'refactor',
  IMPROVE: 'improve',
  ARCHITECTURE: 'architecture',
  QUALITY: 'quality',
  COMPLEXITY: 'complexity',
  IMPACT: 'impact'
};

document.addEventListener('DOMContentLoaded', function () {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const summarizePageBtn = document.getElementById('summarizePageBtn');
  const explainCodeBtn = document.getElementById('explainCodeBtn');
  const refactorCodeBtn = document.getElementById('refactorCodeBtn');
  const improveCodeBtn = document.getElementById('improveCodeBtn');
  const architectureBtn = document.getElementById('architectureBtn');
  const qualityBtn = document.getElementById('qualityBtn');
  const complexityBtn = document.getElementById('complexityBtn');
  const impactBtn = document.getElementById('impactBtn');
  const generateBtn = document.getElementById('generateBtn');
  const detectBtn = document.getElementById('detectBtn');
  const prBtn = document.getElementById('prBtn');
  const inlineBtn = document.getElementById('inlineBtn');
  const convertBtn = document.getElementById('convertBtn');
  const generateForm = document.getElementById('generateForm');
  const submitGenerate = document.getElementById('submitGenerate');
  const cancelGenerate = document.getElementById('cancelGenerate');
  const problemInput = document.getElementById('problemInput');
  const languageSelect = document.getElementById('languageSelect');
  const constraintsInput = document.getElementById('constraintsInput');
  const statusDiv = document.getElementById('status');
  const summaryResultDiv = document.getElementById('summaryResult');
  const loadingIndicator = document.getElementById('loadingIndicator');

  // Tab switching logic
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.tab;

      // Remove active class from all tabs and panels
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      // Add active class to clicked tab and corresponding panel
      button.classList.add('active');
      document.getElementById(`${target}-tab`).classList.add('active');

      // Clear results when switching tabs
      clearResults();
    });
  });

  // Handle summarize selection button click
  summarizeBtn.addEventListener('click', async function () {
    await handleSummarizeSelection();
  });

  // Handle summarize page button click
  summarizePageBtn.addEventListener('click', async function () {
    await handleSummarizePage();
  });

  // Handle explain code button click
  explainCodeBtn.addEventListener('click', async function () {
    await handleCodeTool(CODE_TOOLS.EXPLAIN);
  });

  // Handle refactor code button click
  refactorCodeBtn.addEventListener('click', async function () {
    await handleCodeTool(CODE_TOOLS.REFACTOR);
  });

  // Handle improve code button click
  improveCodeBtn.addEventListener('click', async function () {
    await handleCodeTool(CODE_TOOLS.IMPROVE);
  });

  // Handle architecture button click
  architectureBtn.addEventListener('click', async function () {
    await handleCodeTool(CODE_TOOLS.ARCHITECTURE);
  });

  // Handle quality button click
  qualityBtn.addEventListener('click', async function () {
    await handleCodeTool(CODE_TOOLS.QUALITY);
  });

  // Handle complexity button click
  complexityBtn.addEventListener('click', async function () {
    await handleCodeTool(CODE_TOOLS.COMPLEXITY);
  });

  // Handle impact button click
  impactBtn.addEventListener('click', async function () {
    await handleCodeTool(CODE_TOOLS.IMPACT);
  });

  // Handle generate code button click
  generateBtn.addEventListener('click', async function () {
    // Show the generate code form
    generateForm.classList.remove('hidden');
    // Clear previous inputs
    problemInput.value = '';
    languageSelect.value = 'python';
    constraintsInput.value = '';
    // Focus on problem input
    problemInput.focus();
    // Hide results
    clearResults();
  });

  // Handle cancel generate button
  cancelGenerate.addEventListener('click', function () {
    generateForm.classList.add('hidden');
  });

  // Handle submit generate button
  submitGenerate.addEventListener('click', async function () {
    await handleGenerateCodeSubmit();
  });

  // Handle detect code blocks button click
  detectBtn.addEventListener('click', async function () {
    await handleDetectBlocks();
  });

  // Handle PR review button click
  prBtn.addEventListener('click', async function () {
    await handlePRReview();
  });

  // Handle inline explanation button click
  inlineBtn.addEventListener('click', async function () {
    await handleInlineExplain();
  });

  // Handle convert language button click
  convertBtn.addEventListener('click', async function () {
    await handleConvertLanguage();
  });

  // Function to handle selected text summarization
  async function handleSummarizeSelection() {
    try {
      // Disable buttons and show loading
      setButtonsDisabled(true);
      showLoading(true);

      // Clear previous results
      clearResults();

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Execute script to get selected text
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
      });

      const selectedText = results[0]?.result;

      // Check if text was selected
      if (!selectedText || selectedText.trim().length === 0) {
        showLoading(false);
        setButtonsDisabled(false);
        showStatus('error', 'Please select some text on the page.');
        return;
      }

      console.log('✅ Selected text captured:', selectedText);
      console.log('📊 Text length:', selectedText.length, 'characters');

      // Send to backend API
      await generateSummary(selectedText);

    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to generate summary: ' + error.message);
    } finally {
      // Re-enable buttons and hide loading
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Function to handle entire page summarization
  async function handleSummarizePage() {
    try {
      // Disable buttons and show loading
      setButtonsDisabled(true);
      showLoading(true);

      // Clear previous results
      clearResults();

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Execute script to extract page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageContent
      });

      const pageText = results[0]?.result;

      // Check if content was extracted
      if (!pageText || pageText.trim().length === 0) {
        showLoading(false);
        setButtonsDisabled(false);
        showStatus('error', 'No readable content found on this page.');
        return;
      }

      console.log('✅ Page content extracted');
      console.log('📊 Original text length:', pageText.length, 'characters');

      // Trim text to prevent large payloads
      const trimmedText = pageText.slice(0, MAX_TEXT_LENGTH);
      console.log('📊 Trimmed text length:', trimmedText.length, 'characters');

      // Send to backend API
      await generateSummary(trimmedText);

    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to generate summary: ' + error.message);
    } finally {
      // Re-enable buttons and hide loading
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Function to generate summary from text
  async function generateSummary(text) {
    const response = await fetch(`${API_BASE_URL}/generate-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: text
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Summary received:', data);

    // Display the summary
    displaySummary(data);
    showStatus('success', '✓ Summary generated successfully!');
  }

  // Function to handle code explanation
  async function handleExplainCode() {
    try {
      // Disable buttons and show loading
      setButtonsDisabled(true);
      showLoading(true);

      // Clear previous results
      clearResults();

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Execute script to get selected text (code)
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
      });

      const selectedCode = results[0]?.result;

      // Check if code was selected
      if (!selectedCode || selectedCode.trim().length === 0) {
        showLoading(false);
        setButtonsDisabled(false);
        showStatus('error', 'Please select code on the page first.');
        return;
      }

      console.log('✅ Selected code captured:', selectedCode);
      console.log('📊 Code length:', selectedCode.length, 'characters');

      // Send to backend API for explanation
      await explainSelectedCode(selectedCode);

    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to explain code: ' + error.message);
    } finally {
      // Re-enable buttons and hide loading
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Function to send code to backend for explanation
  async function explainSelectedCode(code) {
    // Step 1: Submit code to create a session
    const submitResponse = await fetch(`${API_BASE_URL}/code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        language: 'auto',
        context: 'chrome_extension'
      })
    });

    if (!submitResponse.ok) {
      throw new Error(`API error: ${submitResponse.status} ${submitResponse.statusText}`);
    }

    const submitData = await submitResponse.json();
    const sessionId = submitData.session_id;

    console.log('✅ Code session created:', sessionId);

    // Step 2: Get stepwise explanation using the session_id
    const explainResponse = await fetch(`${API_BASE_URL}/code/stepwise/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!explainResponse.ok) {
      throw new Error(`API error: ${explainResponse.status} ${explainResponse.statusText}`);
    }

    const data = await explainResponse.json();
    console.log('✅ Code explanation received:', data);

    // Display the explanation
    displayCodeExplanation(code, data);
    showStatus('success', '✓ Code explanation generated!');
  }

  // Function to capture selected text (runs in page context)
  function getSelectedText() {
    return window.getSelection().toString();
  }

  // Function to extract entire page content (runs in page context)
  function extractPageContent() {
    // Get all visible text from the page body
    const bodyText = document.body.innerText;
    return bodyText;
  }

  // Display summary in the popup
  function displaySummary(data) {
    summaryResultDiv.classList.remove('empty');

    let html = '';

    // Summary text
    if (data.summary) {
      html += `<div class="summary-section"><p>${escapeHtml(data.summary)}</p></div>`;
    }

    // Key points
    if (data.key_points && data.key_points.length > 0) {
      html += '<div class="summary-section">';
      html += '<strong>Key Points:</strong><br>';
      data.key_points.forEach((point, index) => {
        html += `${index + 1}. ${escapeHtml(point)}<br>`;
      });
      html += '</div>';
    }

    // Main themes
    if (data.main_themes && data.main_themes.length > 0) {
      html += '<div class="summary-section">';
      html += '<strong>Main Themes:</strong><br>';
      data.main_themes.forEach((theme, index) => {
        html += `• ${escapeHtml(theme)}<br>`;
      });
      html += '</div>';
    }

    summaryResultDiv.innerHTML = html;
  }

  // Display code explanation in the popup
  function displayCodeExplanation(code, data) {
    summaryResultDiv.classList.remove('empty');

    let html = '';

    // Display selected code
    html += '<div class="summary-section">';
    html += '<strong>Selected Code:</strong><br>';
    html += `<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(code)}</pre>`;
    html += '</div>';

    // Display stepwise explanation (main field from backend)
    if (data.stepwise_explanation) {
      html += '<div class="summary-section">';
      html += '<strong>Step-by-Step Explanation:</strong><br>';
      html += `<p style="white-space: pre-wrap;">${escapeHtml(data.stepwise_explanation)}</p>`;
      html += '</div>';
    }
    // Fallback to explanation field
    else if (data.explanation) {
      html += '<div class="summary-section">';
      html += '<strong>Explanation:</strong><br>';
      html += `<p style="white-space: pre-wrap;">${escapeHtml(data.explanation)}</p>`;
      html += '</div>';
    }
    // Fallback to steps array
    else if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
      html += '<div class="summary-section">';
      html += '<strong>Execution Steps:</strong><br>';
      data.steps.forEach((step, index) => {
        html += `<div style="margin-bottom: 8px;">`;
        html += `<strong>Step ${index + 1}:</strong> ${escapeHtml(step)}<br>`;
        html += `</div>`;
      });
      html += '</div>';
    }
    // If no explanation found, show raw data
    else {
      html += '<div class="summary-section">';
      html += '<strong>Response:</strong><br>';
      html += `<pre style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; white-space: pre-wrap;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
      html += '</div>';
    }

    summaryResultDiv.innerHTML = html;
  }

  // Helper function to escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Helper function to show/hide loading indicator
  function showLoading(show) {
    if (show) {
      loadingIndicator.classList.add('visible');
    } else {
      loadingIndicator.classList.remove('visible');
    }
  }

  // Helper function to show status messages
  function showStatus(type, message) {
    statusDiv.className = `status ${type}`;
    statusDiv.textContent = message;

    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.className = 'status';
        statusDiv.textContent = '';
      }, 3000);
    }
  }

  // Helper function to clear results
  function clearResults() {
    statusDiv.className = 'status';
    statusDiv.textContent = '';
    summaryResultDiv.classList.add('empty');
    summaryResultDiv.innerHTML = 'Your summary will appear here.';
  }

  // Unified function to handle all code tool operations
  async function handleCodeTool(action) {
    try {
      // Disable buttons and show loading
      setButtonsDisabled(true);
      showLoading(true);

      // Clear previous results
      clearResults();

      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab || !tab.id) {
        throw new Error('No active tab found');
      }

      // Execute script to get selected text (code)
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
      });

      const selectedCode = results[0]?.result;

      // Check if code was selected
      if (!selectedCode || selectedCode.trim().length === 0) {
        showLoading(false);
        setButtonsDisabled(false);
        showStatus('error', 'Please select code on the page first.');
        return;
      }

      console.log(`✅ Selected code captured for ${action}:`, selectedCode);
      console.log('📊 Code length:', selectedCode.length, 'characters');

      // Step 1: Submit code to create a session
      const submitResponse = await fetch(`${API_BASE_URL}/code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: selectedCode,
          language: 'auto',
          context: 'chrome_extension'
        })
      });

      if (!submitResponse.ok) {
        throw new Error(`API error: ${submitResponse.status} ${submitResponse.statusText}`);
      }

      const submitData = await submitResponse.json();
      const sessionId = submitData.session_id;

      console.log('✅ Code session created:', sessionId);

      // Step 2: Execute the requested code tool
      const data = await executeCodeToolAction(action, sessionId);

      // Display the result
      displayCodeToolResult(selectedCode, action, data);
      showStatus('success', `✓ ${getActionLabel(action)} completed!`);

    } catch (error) {
      console.error('Error:', error);
      showStatus('error', `Failed to ${getActionLabel(action).toLowerCase()}: ` + error.message);
    } finally {
      // Re-enable buttons and hide loading
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Execute code tool action with session ID
  async function executeCodeToolAction(action, sessionId) {
    // Special handling for Refactor Impact - requires refactor step first
    if (action === CODE_TOOLS.IMPACT) {
      // Step 1: Refactor the code first
      console.log('🔄 Step 1: Refactoring code before impact analysis...');
      const refactorResponse = await fetch(`${API_BASE_URL}/code/refactor/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!refactorResponse.ok) {
        throw new Error(`Refactor API error: ${refactorResponse.status} ${refactorResponse.statusText}`);
      }

      const refactorData = await refactorResponse.json();
      console.log('✅ Step 1 complete: Code refactored');

      // Step 2: Get refactor impact analysis
      console.log('🔍 Step 2: Analyzing refactor impact...');
      const impactResponse = await fetch(`${API_BASE_URL}/code/refactor-impact/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!impactResponse.ok) {
        throw new Error(`Impact API error: ${impactResponse.status} ${impactResponse.statusText}`);
      }

      const impactData = await impactResponse.json();
      console.log(`✅ Step 2 complete: Impact analysis received`, impactData);

      return impactData;
    }

    // Standard single-step workflow for other tools
    const endpoints = {
      [CODE_TOOLS.EXPLAIN]: `/code/stepwise/${sessionId}`,
      [CODE_TOOLS.REFACTOR]: `/code/refactor/${sessionId}`,
      [CODE_TOOLS.IMPROVE]: `/code/improve/${sessionId}`,
      [CODE_TOOLS.ARCHITECTURE]: `/code/architecture/${sessionId}`,
      [CODE_TOOLS.QUALITY]: `/code/quality/${sessionId}`,
      [CODE_TOOLS.COMPLEXITY]: `/code/complexity/${sessionId}`
    };

    const endpoint = endpoints[action];
    if (!endpoint) {
      throw new Error(`Unsupported action: ${action}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${action} response:`, data);

    return data;
  }

  // Get human-readable label for action
  function getActionLabel(action) {
    const labels = {
      [CODE_TOOLS.EXPLAIN]: 'Explain Code',
      [CODE_TOOLS.REFACTOR]: 'Refactor Code',
      [CODE_TOOLS.IMPROVE]: 'Improve Code',
      [CODE_TOOLS.ARCHITECTURE]: 'Architecture Analysis',
      [CODE_TOOLS.QUALITY]: 'Code Quality',
      [CODE_TOOLS.COMPLEXITY]: 'Complexity Analysis',
      [CODE_TOOLS.IMPACT]: 'Refactor Impact'
    };
    return labels[action] || action;
  }

  // Unified display function for all code tool results
  function displayCodeToolResult(code, action, data) {
    summaryResultDiv.classList.remove('empty');

    let html = '';

    // Display selected code (skip for some tools to reduce clutter)
    const skipCodeDisplay = [CODE_TOOLS.QUALITY, CODE_TOOLS.COMPLEXITY, CODE_TOOLS.IMPACT];
    if (!skipCodeDisplay.includes(action)) {
      html += '<div class="summary-section">';
      html += '<strong>Selected Code:</strong><br>';
      html += `<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(code)}</pre>`;
      html += '</div>';
    }

    // Display result based on action type
    switch (action) {
      case CODE_TOOLS.EXPLAIN:
        html += displayExplanation(data);
        break;
      case CODE_TOOLS.REFACTOR:
        html += displayRefactor(data);
        break;
      case CODE_TOOLS.IMPROVE:
        html += displayImprovement(data);
        break;
      case CODE_TOOLS.ARCHITECTURE:
        html += displayArchitecture(data);
        break;
      case CODE_TOOLS.QUALITY:
        html += displayQuality(data);
        break;
      case CODE_TOOLS.COMPLEXITY:
        html += displayComplexity(data);
        break;
      case CODE_TOOLS.IMPACT:
        html += displayImpact(data);
        break;
      default:
        html += displayGeneric(data);
    }

    summaryResultDiv.innerHTML = html;
  }

  // Display functions for each tool type
  function displayExplanation(data) {
    let html = '';
    if (data.stepwise_explanation) {
      html += '<div class="summary-section">';
      html += '<strong>Step-by-Step Explanation:</strong><br>';
      html += `<p style="white-space: pre-wrap;">${escapeHtml(data.stepwise_explanation)}</p>`;
      html += '</div>';
    }
    return html;
  }

  function displayRefactor(data) {
    let html = '';
    if (data.refactored_code) {
      html += '<div class="summary-section">';
      html += '<strong>Refactored Code:</strong><br>';
      html += `<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(data.refactored_code)}</pre>`;
      html += '</div>';
    }
    if (data.improvements) {
      html += '<div class="summary-section">';
      html += '<strong>Improvements:</strong><br>';
      html += `<p>${escapeHtml(data.improvements)}</p>`;
      html += '</div>';
    }
    return html;
  }

  function displayImprovement(data) {
    let html = '';
    if (data.improvements) {
      html += '<div class="summary-section">';
      html += '<strong>Suggested Improvements:</strong><br>';
      html += `<p style="white-space: pre-wrap;">${escapeHtml(data.improvements)}</p>`;
      html += '</div>';
    }
    return html;
  }

  function displayArchitecture(data) {
    let html = '';

    // Extract architecture analysis from various possible response structures
    const analysis = data?.architecture_analysis ??
      data?.analysis ??
      data?.data?.architecture_analysis ??
      data?.data?.analysis;

    if (analysis) {
      html += '<div class="summary-section">';
      html += '<strong>🏗️ Architecture Analysis</strong><br>';
      html += `<p style="white-space: pre-wrap; margin-top: 8px;">${escapeHtml(analysis)}</p>`;
      html += '</div>';
    } else {
      html += '<div class="summary-section">';
      html += '<strong>❌ Analysis Failed</strong><br>';
      html += '<p style="margin-top: 8px;">No architecture analysis data was returned from the API.</p>';
      html += '</div>';
    }

    return html;
  }

  function displayQuality(data) {
    let html = '';

    // Extract quality data from various possible response structures
    const readability = data?.data?.readability ?? data?.readability;
    const efficiency = data?.data?.efficiency ?? data?.efficiency;
    const maintainability = data?.data?.maintainability ?? data?.maintainability;
    const overall = data?.data?.overall ?? data?.overall;
    const summary = data?.data?.summary ?? data?.summary;

    // Check if we have valid quality data
    if (readability !== undefined || efficiency !== undefined ||
      maintainability !== undefined || overall !== undefined || summary) {

      html += '<div class="summary-section">';
      html += '<strong>📊 Code Quality Analysis</strong><br><br>';

      // Display scores if available
      if (readability !== undefined || efficiency !== undefined ||
        maintainability !== undefined || overall !== undefined) {
        html += '<div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; margin-bottom: 12px;">';

        if (readability !== undefined) {
          html += `<div style="margin-bottom: 8px;">`;
          html += `<strong>📖 Readability:</strong> ${readability}/10`;
          html += `</div>`;
        }

        if (efficiency !== undefined) {
          html += `<div style="margin-bottom: 8px;">`;
          html += `<strong>⚡ Efficiency:</strong> ${efficiency}/10`;
          html += `</div>`;
        }

        if (maintainability !== undefined) {
          html += `<div style="margin-bottom: 8px;">`;
          html += `<strong>🔧 Maintainability:</strong> ${maintainability}/10`;
          html += `</div>`;
        }

        if (overall !== undefined) {
          html += `<div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">`;
          html += `<strong>✨ Overall Score:</strong> ${overall}/10`;
          html += `</div>`;
        }

        html += '</div>';
      }

      // Display summary if available
      if (summary) {
        html += '<div style="margin-top: 12px;">';
        html += '<strong>📝 Summary:</strong><br>';
        html += `<p style="white-space: pre-wrap; margin-top: 8px;">${escapeHtml(summary)}</p>`;
        html += '</div>';
      }

      html += '</div>';
    } else {
      // Only show error if API call succeeded but returned no data
      html += '<div class="summary-section">';
      html += '<strong>❌ Analysis Failed</strong><br>';
      html += '<p style="margin-top: 8px;">No quality analysis data was returned from the API.</p>';
      html += '</div>';
    }

    return html;
  }

  function displayComplexity(data) {
    let html = '';
    if (data.time_complexity) {
      html += '<div class="summary-section">';
      html += '<strong>Time Complexity:</strong><br>';
      html += `<p>${escapeHtml(data.time_complexity)}</p>`;
      html += '</div>';
    }
    if (data.space_complexity) {
      html += '<div class="summary-section">';
      html += '<strong>Space Complexity:</strong><br>';
      html += `<p>${escapeHtml(data.space_complexity)}</p>`;
      html += '</div>';
    }
    if (data.justification) {
      html += '<div class="summary-section">';
      html += '<strong>Justification:</strong><br>';
      html += `<p style="white-space: pre-wrap;">${escapeHtml(data.justification)}</p>`;
      html += '</div>';
    }
    return html;
  }

  function displayImpact(data) {
    let html = '';

    // Extract impact data from various possible response structures
    const originalComplexity = data?.data?.original_time_complexity ??
      data?.original_time_complexity ??
      data?.data?.original_complexity ??
      data?.original_complexity;

    const refactoredComplexity = data?.data?.refactored_time_complexity ??
      data?.refactored_time_complexity ??
      data?.data?.refactored_complexity ??
      data?.refactored_complexity;

    const improvementSummary = data?.data?.improvement_summary ??
      data?.improvement_summary ??
      data?.data?.impact_summary ??
      data?.impact_summary ??
      data?.data?.summary ??
      data?.summary;

    // Check if we have valid impact data
    if (originalComplexity || refactoredComplexity || improvementSummary) {

      html += '<div class="summary-section">';
      html += '<strong>🔍 Refactor Impact Analysis</strong><br><br>';

      // Display complexity comparison if available
      if (originalComplexity || refactoredComplexity) {
        html += '<div style="background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; margin-bottom: 12px;">';

        if (originalComplexity) {
          html += `<div style="margin-bottom: 8px;">`;
          html += `<strong>📉 Original Complexity:</strong> ${escapeHtml(originalComplexity)}`;
          html += `</div>`;
        }

        if (refactoredComplexity) {
          html += `<div style="margin-bottom: 8px;">`;
          html += `<strong>📈 Refactored Complexity:</strong> ${escapeHtml(refactoredComplexity)}`;
          html += `</div>`;
        }

        html += '</div>';
      }

      // Display improvement summary if available
      if (improvementSummary) {
        html += '<div style="margin-top: 12px;">';
        html += '<strong>💡 Impact Summary:</strong><br>';
        html += `<p style="white-space: pre-wrap; margin-top: 8px;">${escapeHtml(improvementSummary)}</p>`;
        html += '</div>';
      }

      html += '</div>';
    } else {
      // Only show error if API call succeeded but returned no data
      html += '<div class="summary-section">';
      html += '<strong>❌ Analysis Failed</strong><br>';
      html += '<p style="margin-top: 8px;">No refactor impact data was returned from the API.</p>';
      html += '</div>';
    }

    return html;
  }

  function displayGeneric(data) {
    let html = '<div class="summary-section">';
    html += '<strong>Result:</strong><br>';
    html += `<pre style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; white-space: pre-wrap;">${escapeHtml(JSON.stringify(data, null, 2))}</pre>`;
    html += '</div>';
    return html;
  }

  // Helper function to enable/disable buttons
  function setButtonsDisabled(disabled) {
    summarizeBtn.disabled = disabled;
    summarizePageBtn.disabled = disabled;
    explainCodeBtn.disabled = disabled;
    refactorCodeBtn.disabled = disabled;
    improveCodeBtn.disabled = disabled;
    architectureBtn.disabled = disabled;
    qualityBtn.disabled = disabled;
    complexityBtn.disabled = disabled;
    impactBtn.disabled = disabled;
    generateBtn.disabled = disabled;
    detectBtn.disabled = disabled;
    prBtn.disabled = disabled;
    inlineBtn.disabled = disabled;
    convertBtn.disabled = disabled;
    submitGenerate.disabled = disabled;
  }

  // Handler for Generate Code Submit
  async function handleGenerateCodeSubmit() {
    const problemStatement = problemInput.value.trim();
    const language = languageSelect.value;
    const constraints = constraintsInput.value.trim();

    // Validate required fields
    if (!problemStatement) {
      showStatus('error', 'Problem description is required.');
      problemInput.focus();
      return;
    }

    // Validate language
    if (!language) {
      showStatus('error', 'Language is required.');
      languageSelect.focus();
      return;
    }

    try {
      // Hide form
      generateForm.classList.add('hidden');

      setButtonsDisabled(true);
      showLoading(true);
      clearResults();

      // Prepare request payload matching backend schema
      const requestPayload = {
        problem_description: problemStatement,
        language: language,
        constraints: constraints || null
      };

      // Debug logging
      console.log('🧠 Generate Code Request:', requestPayload);

      const response = await fetch(`${API_BASE_URL}/code/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });

      // Handle API errors with detailed message
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Generate Code Error:', errorText);
        let errorMessage = `API error: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Generate Code Response:', data);

      displayGeneratedCode(data, language);
      showStatus('success', `✓ ${language} code generated successfully!`);
    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to generate code: ' + error.message);
      // Show form again on error so user can retry
      generateForm.classList.remove('hidden');
    } finally {
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Handler for Detect Code Blocks
  async function handleDetectBlocks() {
    try {
      setButtonsDisabled(true);
      showLoading(true);
      clearResults();

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractPageContent
      });

      const pageContent = results[0]?.result;
      if (!pageContent) {
        throw new Error('Failed to extract page content');
      }

      const response = await fetch(`${API_BASE_URL}/code/detect-blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_content: pageContent })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      displayDetectedBlocks(data);
      showStatus('success', `✓ Found ${data.code_blocks?.length || 0} code blocks!`);
    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to detect code blocks: ' + error.message);
    } finally {
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Handler for PR Review
  async function handlePRReview() {
    try {
      setButtonsDisabled(true);
      showLoading(true);
      clearResults();

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
      });

      const codeDiff = results[0]?.result;
      if (!codeDiff || codeDiff.trim().length === 0) {
        showLoading(false);
        setButtonsDisabled(false);
        showStatus('error', 'Please select code diff on the page first.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/code/pr-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_diff: codeDiff,
          language: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      displayPRReview(data);
      showStatus('success', '✓ PR review completed!');
    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to review PR: ' + error.message);
    } finally {
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Handler for Inline Explanation
  async function handleInlineExplain() {
    try {
      setButtonsDisabled(true);
      showLoading(true);
      clearResults();

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
      });

      const code = results[0]?.result;
      if (!code || code.trim().length === 0) {
        showLoading(false);
        setButtonsDisabled(false);
        showStatus('error', 'Please select code on the page first.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/code/inline-explain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          language: 'auto'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      displayInlineExplanation(code, data);
      showStatus('success', '✓ Inline explanation generated!');
    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to generate inline explanation: ' + error.message);
    } finally {
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Handler for Convert Language
  async function handleConvertLanguage() {
    try {
      setButtonsDisabled(true);
      showLoading(true);
      clearResults();

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: getSelectedText
      });

      const sourceCode = results[0]?.result;
      if (!sourceCode || sourceCode.trim().length === 0) {
        showLoading(false);
        setButtonsDisabled(false);
        showStatus('error', 'Please select code on the page first.');
        return;
      }

      const sourceLanguage = prompt('Enter source language (e.g., python, javascript):', 'python');
      if (!sourceLanguage) {
        showLoading(false);
        setButtonsDisabled(false);
        return;
      }

      const targetLanguage = prompt('Enter target language (e.g., python, javascript):', 'javascript');
      if (!targetLanguage) {
        showLoading(false);
        setButtonsDisabled(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/code/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_code: sourceCode,
          source_language: sourceLanguage,
          target_language: targetLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      displayConvertedCode(sourceCode, sourceLanguage, targetLanguage, data);
      showStatus('success', `✓ Code converted from ${sourceLanguage} to ${targetLanguage}!`);
    } catch (error) {
      console.error('Error:', error);
      showStatus('error', 'Failed to convert code: ' + error.message);
    } finally {
      showLoading(false);
      setButtonsDisabled(false);
    }
  }

  // Display functions for new tools
  function displayGeneratedCode(data, language) {
    summaryResultDiv.classList.remove('empty');
    let html = '<div class="summary-section">';
    html += `<strong>🧠 Generated Code (${escapeHtml(language)})</strong><br>`;
    html += `<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word; margin-top: 8px;">${escapeHtml(data.generated_code || data.code || JSON.stringify(data))}</pre>`;
    html += '</div>';
    summaryResultDiv.innerHTML = html;
  }

  function displayDetectedBlocks(data) {
    summaryResultDiv.classList.remove('empty');
    let html = '<div class="summary-section">';
    html += `<strong>🔎 Detected ${data.code_blocks?.length || 0} Code Blocks</strong><br><br>`;

    if (data.code_blocks && data.code_blocks.length > 0) {
      data.code_blocks.forEach((block, index) => {
        html += `<div style="margin-bottom: 16px;">`;
        html += `<strong>Block ${index + 1} (${escapeHtml(block.language)}):</strong><br>`;
        html += `<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word; margin-top: 8px;">${escapeHtml(block.code)}</pre>`;
        html += `</div>`;
      });
    } else {
      html += '<p>No code blocks detected on this page.</p>';
    }

    html += '</div>';
    summaryResultDiv.innerHTML = html;
  }

  function displayPRReview(data) {
    summaryResultDiv.classList.remove('empty');
    let html = '<div class="summary-section">';
    html += '<strong>📦 PR Review</strong><br><br>';

    if (data.summary) {
      html += '<div style="margin-bottom: 12px;">';
      html += '<strong>📝 Summary:</strong><br>';
      html += `<p style="margin-top: 8px;">${escapeHtml(data.summary)}</p>`;
      html += '</div>';
    }

    if (data.issues && data.issues.length > 0) {
      html += '<div style="margin-bottom: 12px;">';
      html += '<strong>⚠️ Issues:</strong><br>';
      html += '<ul style="margin-top: 8px; margin-left: 20px;">';
      data.issues.forEach(issue => {
        html += `<li>${escapeHtml(issue)}</li>`;
      });
      html += '</ul>';
      html += '</div>';
    }

    if (data.suggestions && data.suggestions.length > 0) {
      html += '<div style="margin-bottom: 12px;">';
      html += '<strong>💡 Suggestions:</strong><br>';
      html += '<ul style="margin-top: 8px; margin-left: 20px;">';
      data.suggestions.forEach(suggestion => {
        html += `<li>${escapeHtml(suggestion)}</li>`;
      });
      html += '</ul>';
      html += '</div>';
    }

    html += '</div>';
    summaryResultDiv.innerHTML = html;
  }

  function displayInlineExplanation(code, data) {
    summaryResultDiv.classList.remove('empty');
    let html = '<div class="summary-section">';
    html += '<strong>📖 Inline Explanation</strong><br><br>';

    if (data.explanations && data.explanations.length > 0) {
      const codeLines = code.split('\n');
      data.explanations.forEach(exp => {
        const lineNum = exp.line;
        const codeLine = codeLines[lineNum - 1] || '';
        html += `<div style="margin-bottom: 12px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px;">`;
        html += `<strong>Line ${lineNum}:</strong><br>`;
        html += `<code style="background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${escapeHtml(codeLine)}</code><br>`;
        html += `<p style="margin-top: 8px; font-size: 13px;">${escapeHtml(exp.explanation)}</p>`;
        html += `</div>`;
      });
    } else {
      html += '<p>No explanations generated.</p>';
    }

    html += '</div>';
    summaryResultDiv.innerHTML = html;
  }

  function displayConvertedCode(sourceCode, sourceLang, targetLang, data) {
    summaryResultDiv.classList.remove('empty');
    let html = '<div class="summary-section">';
    html += `<strong>🔁 Converted: ${escapeHtml(sourceLang)} → ${escapeHtml(targetLang)}</strong><br><br>`;

    html += '<div style="margin-bottom: 12px;">';
    html += `<strong>Original (${escapeHtml(sourceLang)}):</strong><br>`;
    html += `<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word; margin-top: 8px;">${escapeHtml(sourceCode)}</pre>`;
    html += '</div>';

    html += '<div style="margin-bottom: 12px;">';
    html += `<strong>Converted (${escapeHtml(targetLang)}):</strong><br>`;
    html += `<pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; overflow-x: auto; font-size: 12px; font-family: 'Courier New', monospace; white-space: pre-wrap; word-wrap: break-word; margin-top: 8px;">${escapeHtml(data.converted_code || JSON.stringify(data))}</pre>`;
    html += '</div>';

    html += '</div>';
    summaryResultDiv.innerHTML = html;
  }

  // Log popup loaded
  console.log('🎨 AI Learning Assistant popup loaded');
});
