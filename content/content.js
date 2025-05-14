// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scanLinks') {
        scanPageLinks(message.settings)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ error: error.message }));
        return true; // Indicates asynchronous response
    }
});

// Scan page for links
async function scanPageLinks(settings) {
    // Get all links on the page
    const linkElements = document.querySelectorAll('a[href]');
    const baseUrl = window.location.origin;
    const currentPath = window.location.pathname;

    const linksToCheck = [];
    const processedUrls = new Set(); // To avoid duplicate URLs

    // Process links
    for (const link of linkElements) {
        let href = link.getAttribute('href');

        // Skip empty, javascript, or mailto links
        if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
            continue;
        }

        // Normalize URL
        let fullUrl;
        let isExternal = false;

        if (href.startsWith('http://') || href.startsWith('https://')) {
            // Absolute URL
            fullUrl = href;
            isExternal = !href.startsWith(baseUrl);
        } else if (href.startsWith('/')) {
            // Root-relative URL
            fullUrl = baseUrl + href;
            isExternal = false;
        } else {
            // Path-relative URL
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
            fullUrl = baseUrl + basePath + href;
            isExternal = false;
        }

        // Skip if already processed
        if (processedUrls.has(fullUrl)) {
            continue;
        }

        // Add to processed set
        processedUrls.add(fullUrl);

        // Check if we should test this link based on settings
        if ((isExternal && settings.checkExternal) || (!isExternal && settings.checkInternal)) {
            linksToCheck.push({
                url: fullUrl,
                isExternal: isExternal
            });
        }
    }

    // Check each link
    const brokenLinks = [];
    const maxConcurrent = 5; // Maximum concurrent requests
    const chunks = [];

    // Split links into chunks for concurrent processing
    for (let i = 0; i < linksToCheck.length; i += maxConcurrent) {
        chunks.push(linksToCheck.slice(i, i + maxConcurrent));
    }

    // Process chunks sequentially
    for (const chunk of chunks) {
        const results = await Promise.all(chunk.map(link =>
            checkLink(link.url, link.isExternal, settings.timeout)
        ));

        // Add broken links to result
        results.forEach(result => {
            if (result && result.broken) {
                brokenLinks.push(result);
            }
        });
    }

    return {
        brokenLinks: brokenLinks,
        totalChecked: linksToCheck.length
    };
}

// Check if a link is broken
async function checkLink(url, isExternal, timeout) {
    try {
        // Send request to background script
        const result = await browser.runtime.sendMessage({
            action: 'checkLink',
            url: url,
            timeout: timeout
        });

        // Process result
        if (!result.ok || result.status >= 400) {
            return {
                url: url,
                statusCode: result.status,
                error: result.error,
                isExternal: isExternal,
                broken: true
            };
        }

        return {
            url: url,
            statusCode: result.status,
            isExternal: isExternal,
            broken: false
        };
    } catch (error) {
        return {
            url: url,
            statusCode: 0,
            error: error.message,
            isExternal: isExternal,
            broken: true
        };
    }
}
