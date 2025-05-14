// Global variables
let currentTab = null;
let lastScanResults = null;
let settings = {
    checkExternal: true,
    checkInternal: true,
    timeout: 5000,
    historyLimit: 100
};

// DOM Elements
const tabButtons = {
    links: document.getElementById('tab-links'),
    history: document.getElementById('tab-history'),
    settings: document.getElementById('tab-settings')
};

const panels = {
    links: document.getElementById('links-panel'),
    history: document.getElementById('history-panel'),
    settings: document.getElementById('settings-panel')
};

const elements = {
    scanButton: document.getElementById('scan-button'),
    downloadReportButton: document.getElementById('download-report'),
    clearHistoryButton: document.getElementById('clear-history'),
    saveSettingsButton: document.getElementById('save-settings'),
    loadingSpinner: document.getElementById('loading-spinner'),
    linksContainer: document.getElementById('links-container'),
    historyContainer: document.getElementById('history-container'),
    linksCount: document.getElementById('links-count'),
    historyCount: document.getElementById('history-count'),
    currentYear: document.getElementById('current-year'),
    // Settings elements
    checkExternal: document.getElementById('check-external'),
    checkInternal: document.getElementById('check-internal'),
    timeout: document.getElementById('timeout'),
    historyLimit: document.getElementById('history-limit')
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    // Load settings
    await loadSettings();

    // Set current tab info
    await getCurrentTab();

    // Set event listeners
    setupEventListeners();

    // Load history data
    await loadHistory();

    // Update UI based on settings
    updateSettingsUI();

    // Set current year in footer
    updateCopyrightYear();
});

// Tab switching functionality
function switchTab(tabName) {
    // Hide all panels
    Object.values(panels).forEach(panel => {
        panel.classList.remove('active');
    });

    // Deactivate all tab buttons
    Object.values(tabButtons).forEach(button => {
        button.classList.remove('active');
    });

    // Show selected panel and activate button
    panels[tabName].classList.add('active');
    tabButtons[tabName].classList.add('active');
}

// Load settings from storage
async function loadSettings() {
    try {
        const result = await browser.storage.local.get('settings');
        if (result.settings) {
            settings = result.settings;
        } else {
            // Save default settings if none exist
            await browser.storage.local.set({ settings });
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Update UI with current settings
function updateSettingsUI() {
    elements.checkExternal.checked = settings.checkExternal;
    elements.checkInternal.checked = settings.checkInternal;
    elements.timeout.value = settings.timeout;
    elements.historyLimit.value = settings.historyLimit;
}

// Save settings
async function saveSettings() {
    // Update settings object
    settings.checkExternal = elements.checkExternal.checked;
    settings.checkInternal = elements.checkInternal.checked;
    settings.timeout = parseInt(elements.timeout.value);
    settings.historyLimit = parseInt(elements.historyLimit.value);

    try {
        await browser.storage.local.set({ settings });
        showNotification('Settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        showNotification('Failed to save settings', 'error');
    }
}

// Get current tab info
async function getCurrentTab() {
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]) {
            currentTab = tabs[0];
        }
    } catch (error) {
        console.error('Error getting current tab:', error);
    }
}

// Scan page for broken links
async function scanPage() {
    if (!currentTab) {
        showNotification('No active tab found', 'error');
        return;
    }

    // Disable download button during scan
    elements.downloadReportButton.disabled = true;

    // Show loading spinner
    elements.loadingSpinner.classList.remove('hidden');
    elements.linksContainer.innerHTML = '';

    try {
        // Send message to content script
        const response = await browser.tabs.sendMessage(currentTab.id, {
            action: 'scanLinks',
            settings: settings
        });

        // Process response
        displayBrokenLinks(response.brokenLinks);

        // Save to history
        await saveToHistory({
            title: currentTab.title,
            url: currentTab.url,
            timestamp: Date.now(),
            brokenLinksCount: response.brokenLinks.length
        });

        // Update history panel
        await loadHistory();

    } catch (error) {
        console.error('Error scanning page:', error);
        elements.linksContainer.innerHTML = '<div class="no-data">Failed to scan page. Make sure the page is fully loaded.</div>';
    } finally {
        // Hide loading spinner
        elements.loadingSpinner.classList.add('hidden');
    }
}

// Display broken links in UI
function displayBrokenLinks(brokenLinks) {
    // Store results for report generation
    lastScanResults = brokenLinks;

    // Update count
    elements.linksCount.textContent = brokenLinks.length;

    // Enable/disable download button
    elements.downloadReportButton.disabled = brokenLinks.length === 0;

    // Clear container
    elements.linksContainer.innerHTML = '';

    if (brokenLinks.length === 0) {
        elements.linksContainer.innerHTML = '<div class="no-data">No broken links found</div>';
        return;
    }

    // Create elements for each broken link
    brokenLinks.forEach(link => {
        const linkItem = document.createElement('div');
        linkItem.className = 'link-item';

        linkItem.innerHTML = `
      <div class="link-url">${link.url}</div>
      <div class="link-status">
        <span class="link-code">${link.statusCode || 'ERR'}</span>
        <span class="link-type">${link.isExternal ? 'External' : 'Internal'}</span>
      </div>
    `;

        elements.linksContainer.appendChild(linkItem);
    });
}

// Save scan to history
async function saveToHistory(historyItem) {
    try {
        // Get existing history
        const result = await browser.storage.local.get('history');
        let history = result.history || [];

        // Add new item at the beginning
        history.unshift(historyItem);

        // Limit history size
        if (history.length > settings.historyLimit) {
            history = history.slice(0, settings.historyLimit);
        }

        // Save updated history
        await browser.storage.local.set({ history });
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    tabButtons.links.addEventListener('click', () => switchTab('links'));
    tabButtons.history.addEventListener('click', () => switchTab('history'));
    tabButtons.settings.addEventListener('click', () => switchTab('settings'));

    // Button actions
    elements.scanButton.addEventListener('click', scanPage);
    elements.downloadReportButton.addEventListener('click', downloadReport);
    elements.clearHistoryButton.addEventListener('click', clearHistory);
    elements.saveSettingsButton.addEventListener('click', saveSettings);
}

// Load history from storage
async function loadHistory() {
    try {
        const result = await browser.storage.local.get('history');
        const history = result.history || [];

        // Update count
        elements.historyCount.textContent = history.length;

        // Clear container
        elements.historyContainer.innerHTML = '';

        if (history.length === 0) {
            elements.historyContainer.innerHTML = '<div class="no-data">No history available</div>';
            return;
        }

        // Create elements for each history item
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            historyItem.innerHTML = `
        <div class="history-title">${item.title}</div>
        <div class="history-url">${item.url}</div>
        <div class="history-meta">
          <span class="history-date">${formattedDate}</span>
          <span class="history-count">${item.brokenLinksCount} broken links</span>
        </div>
      `;

            // Add click event to re-scan this URL
            historyItem.addEventListener('click', () => {
                browser.tabs.create({ url: item.url });
            });

            elements.historyContainer.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Clear all history
async function clearHistory() {
    try {
        await browser.storage.local.remove('history');
        elements.historyContainer.innerHTML = '<div class="no-data">No history available</div>';
        elements.historyCount.textContent = '0';
        showNotification('History cleared', 'success');
    } catch (error) {
        console.error('Error clearing history:', error);
        showNotification('Failed to clear history', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Simple notification implementation
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Update copyright year in footer
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    elements.currentYear.textContent = currentYear;
}

// Generate and download report
function downloadReport() {
    if (!currentTab || !lastScanResults || lastScanResults.length === 0) {
        showNotification('No scan results to download', 'error');
        return;
    }

    try {
        // Build CSV content
        let csvContent = 'URL,Status Code,Type\n';

        lastScanResults.forEach(link => {
            csvContent += `"${link.url}",${link.statusCode || 'ERR'},"${link.isExternal ? 'External' : 'Internal'}"\n`;
        });

        // Create a blob with CSV content
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `broken-links-${timestamp}.csv`;

        // Use browser downloads API (more reliable in extensions)
        browser.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
        }).then(() => {
            showNotification('Report downloaded successfully', 'success');
        }).catch(error => {
            console.error('Download error:', error);
            showNotification('Failed to download report', 'error');
        });

    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Failed to generate report', 'error');
    }
}
