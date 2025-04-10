// Handle installation and updates
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Set default settings
        chrome.storage.sync.set({
            settings: {
                enableHighlight: true,
                highlightColor: '#4f46e5',
                showMeasurements: true,
                autoCloseMenus: true,
                enableKeyboardShortcuts: true
            }
        });
        
        // Open welcome page
        chrome.tabs.create({
            url: 'welcome.html'
        });
    }
});

// Context menu creation
chrome.runtime.onInstalled.addListener(() => {
    // Create parent menu
    chrome.contextMenus.create({
        id: 'codecraft',
        title: 'CodeCraft',
        contexts: ['all']
    });

    // Create child menu items
    const menuItems = [
        {
            id: 'clone-element',
            title: 'Clone Element',
            handler: (info, tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const element = document.activeElement;
                        if (element) {
                            const clone = element.cloneNode(true);
                            element.parentNode.insertBefore(clone, element.nextSibling);
                        }
                    }
                });
            }
        },
        {
            id: 'copy-html',
            title: 'Copy HTML',
            handler: (info, tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const element = document.activeElement;
                        if (element) {
                            navigator.clipboard.writeText(element.outerHTML);
                        }
                    }
                });
            }
        },
        {
            id: 'copy-css',
            title: 'Copy CSS',
            handler: (info, tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const element = document.activeElement;
                        if (element) {
                            const styles = window.getComputedStyle(element);
                            let css = element.tagName.toLowerCase() + ' {\n';
                            for (let prop of styles) {
                                css += `    ${prop}: ${styles.getPropertyValue(prop)};\n`;
                            }
                            css += '}';
                            navigator.clipboard.writeText(css);
                        }
                    }
                });
            }
        },
        {
            id: 'export-codepen',
            title: 'Export to CodePen',
            handler: (info, tab) => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const element = document.activeElement;
                        if (element) {
                            const data = {
                                html: element.outerHTML,
                                css: '',
                                js: ''
                            };
                            const form = document.createElement('form');
                            form.action = 'https://codepen.io/pen/define';
                            form.method = 'POST';
                            form.target = '_blank';
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = 'data';
                            input.value = JSON.stringify(data);
                            form.appendChild(input);
                            document.body.appendChild(form);
                            form.submit();
                            document.body.removeChild(form);
                        }
                    }
                });
            }
        }
    ];

    menuItems.forEach(item => {
        chrome.contextMenus.create({
            id: item.id,
            parentId: 'codecraft',
            title: item.title,
            contexts: ['all']
        });
    });

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
        const menuItem = menuItems.find(item => item.id === info.menuItemId);
        if (menuItem) {
            menuItem.handler(info, tab);
        }
    });
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'showNotification':
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'CodeCraft',
                message: request.message
            });
            break;

        case 'crawlWebsite':
            handleWebsiteCrawl(request.url, sender.tab.id);
            break;

        case 'downloadSite':
            handleSiteDownload(request.url, sender.tab.id);
            break;

        case 'toggleInspector':
            toggleInspector(sender.tab.id, request.enabled);
            break;
    }
});

// Handle website crawling
async function handleWebsiteCrawl(url, tabId) {
    try {
        const visited = new Set();
        const queue = [url];
        const results = [];

        while (queue.length > 0) {
            const currentUrl = queue.shift();
            if (visited.has(currentUrl)) continue;

            visited.add(currentUrl);
            try {
                const response = await fetch(currentUrl);
                const html = await response.text();
                
                // Extract links and add to queue
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const links = Array.from(doc.links)
                    .map(link => link.href)
                    .filter(href => href.startsWith(url));
                
                queue.push(...links);
                
                results.push({
                    url: currentUrl,
                    content: html
                });
            } catch (error) {
                console.error(`Error crawling ${currentUrl}:`, error);
            }
        }

        // Send results back to the content script
        chrome.tabs.sendMessage(tabId, {
            type: 'crawlResults',
            results: results
        });
    } catch (error) {
        console.error('Crawl error:', error);
    }
}

// Handle site download
async function handleSiteDownload(url, tabId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        
        // Create zip file
        const zip = new JSZip();
        zip.file('index.html', html);
        
        // Extract and download assets
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Download CSS files
        const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of cssLinks) {
            try {
                const cssUrl = new URL(link.href, url).href;
                const cssResponse = await fetch(cssUrl);
                const css = await cssResponse.text();
                zip.file(`css/${cssUrl.split('/').pop()}`, css);
            } catch (error) {
                console.error(`Error downloading CSS: ${link.href}`, error);
            }
        }
        
        // Download JavaScript files
        const scripts = Array.from(doc.querySelectorAll('script[src]'));
        for (const script of scripts) {
            try {
                const scriptUrl = new URL(script.src, url).href;
                const scriptResponse = await fetch(scriptUrl);
                const js = await scriptResponse.text();
                zip.file(`js/${scriptUrl.split('/').pop()}`, js);
            } catch (error) {
                console.error(`Error downloading JS: ${script.src}`, error);
            }
        }
        
        // Download images
        const images = Array.from(doc.querySelectorAll('img'));
        for (const img of images) {
            try {
                const imgUrl = new URL(img.src, url).href;
                const imgResponse = await fetch(imgUrl);
                const imgBlob = await imgResponse.blob();
                zip.file(`images/${imgUrl.split('/').pop()}`, imgBlob);
            } catch (error) {
                console.error(`Error downloading image: ${img.src}`, error);
            }
        }
        
        // Generate zip file
        const content = await zip.generateAsync({ type: 'blob' });
        
        // Trigger download
        chrome.downloads.download({
            url: URL.createObjectURL(content),
            filename: 'website.zip',
            saveAs: true
        });
    } catch (error) {
        console.error('Download error:', error);
    }
}

// Toggle inspector mode
function toggleInspector(tabId, enabled) {
    chrome.tabs.sendMessage(tabId, {
        action: enabled ? 'startInspecting' : 'stopInspecting'
    });
}

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        switch (command) {
            case 'toggle-inspector':
                chrome.storage.sync.get('inspectorEnabled', (data) => {
                    const newState = !data.inspectorEnabled;
                    chrome.storage.sync.set({ inspectorEnabled: newState });
                    toggleInspector(tab.id, newState);
                });
                break;
            case 'copy-element':
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: () => {
                        const element = document.activeElement;
                        if (element) {
                            navigator.clipboard.writeText(element.outerHTML);
                        }
                    }
                });
                break;
        }
    });
});
