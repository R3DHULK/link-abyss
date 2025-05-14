// Listen for installation
browser.runtime.onInstalled.addListener(() => {
    // Initialize default settings if needed
    browser.storage.local.get('settings').then(result => {
        if (!result.settings) {
            browser.storage.local.set({
                settings: {
                    checkExternal: true,
                    checkInternal: true,
                    timeout: 5000,
                    historyLimit: 100
                }
            });
        }
    });
});

// Listen for messages from content script or popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'checkLink') {
        checkLinkStatus(message.url, message.timeout)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Indicates asynchronous response
    }
});

// Check if a link is broken
async function checkLinkStatus(url, timeout) {
    try {
        const controller = new AbortController();
        const signal = controller.signal;

        // Set timeout
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: signal
        });

        clearTimeout(timeoutId);

        return {
            url: url,
            status: response.status,
            ok: response.ok
        };
    } catch (error) {
        return {
            url: url,
            status: 0,
            ok: false,
            error: error.name === 'AbortError' ? 'Timeout' : error.message
        };
    }
}