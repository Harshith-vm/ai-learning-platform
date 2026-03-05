// Code Tools Module - Unified handler for all code operations
// Tasks 65C-65K: Generate, Refactor, Architecture, Quality, Impact, Optimize, Debug, Test Cases, Complexity

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Unified handler for all code tool operations
 * @param {string} action - The action type (explain, generate, refactor, etc.)
 * @param {object} payload - The request payload
 * @returns {Promise<object>} - The API response
 */
export async function handleCodeTool(action, payload) {
    const endpoints = {
        explain: '/code/stepwise/',
        generate: '/code/generate',
        refactor: '/code/refactor/',
        architecture: '/code/architecture/',
        quality: '/code/quality/',
        impact: '/code/refactor-impact/',
        complexity: '/code/complexity/',
        improve: '/code/improve/'
    };

    const endpoint = endpoints[action];

    if (!endpoint) {
        throw new Error(`Unsupported action: ${action}`);
    }

    // Generate session ID for session-based endpoints
    const sessionId = Date.now().toString();

    // Determine if endpoint needs session ID
    const needsSession = endpoint.includes('/');
    const url = needsSession
        ? `${API_BASE_URL}${endpoint}${sessionId}`
        : `${API_BASE_URL}${endpoint}`;

    console.log(`🔧 Code Tool: ${action} → ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${action} response:`, data);

    return data;
}

/**
 * Submit code to create a session
 * @param {string} code - The code to submit
 * @param {string} language - Programming language
 * @param {string} context - Context information
 * @returns {Promise<string>} - The session ID
 */
export async function submitCodeSession(code, language = 'auto', context = 'chrome_extension') {
    const response = await fetch(`${API_BASE_URL}/code`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: code,
            language: language,
            context: context
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.session_id;
}

/**
 * Execute a session-based code tool
 * @param {string} action - The action type
 * @param {string} sessionId - The session ID
 * @returns {Promise<object>} - The API response
 */
export async function executeCodeTool(action, sessionId) {
    const endpoints = {
        explain: '/code/stepwise/',
        refactor: '/code/refactor/',
        architecture: '/code/architecture/',
        quality: '/code/quality/',
        impact: '/code/refactor-impact/',
        complexity: '/code/complexity/',
        improve: '/code/improve/'
    };

    const endpoint = endpoints[action];

    if (!endpoint) {
        throw new Error(`Unsupported action: ${action}`);
    }

    const url = `${API_BASE_URL}${endpoint}${sessionId}`;
    console.log(`🔧 Executing: ${action} → ${url}`);

    const response = await fetch(url, {
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
