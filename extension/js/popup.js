// Global state
let inspectorActive = false;
let selectedElement = null;

// Feature handlers
const features = {
    // Element Cloning
    cloneElement: async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                window.addEventListener('click', (e) => {
                    e.preventDefault();
                    const clone = e.target.cloneNode(true);
                    // Store clone data
                    chrome.storage.local.set({ 
                        clonedElement: clone.outerHTML 
                    });
                }, { once: true });
            }
        });
    },

    // Code Grabbing
    grabCode: async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const html = document.documentElement.outerHTML;
                const css = Array.from(document.styleSheets)
                    .map(sheet => {
                        try {
                            return Array.from(sheet.cssRules)
                                .map(rule => rule.cssText)
                                .join('\n');
                        } catch (e) {
                            return '';
                        }
                    })
                    .join('\n');
                const scripts = Array.from(document.scripts)
                    .map(script => script.innerHTML)
                    .join('\n');

                return { html, css, scripts };
            }
        });
    },

    // Color Selection
    colorPicker: async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const eyeDropper = new EyeDropper();
                eyeDropper.open()
                    .then(result => {
                        navigator.clipboard.writeText(result.sRGBHex);
                    })
                    .catch(err => console.log(err));
            }
        });
    },

    // Measurement Tools
    measureElements: async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                let measuring = false;
                let startElement = null;

                document.addEventListener('mousemove', (e) => {
                    if (measuring) {
                        const endElement = e.target;
                        const rect1 = startElement.getBoundingClientRect();
                        const rect2 = endElement.getBoundingClientRect();
                        
                        // Calculate distances
                        const distance = {
                            x: Math.abs(rect2.left - rect1.left),
                            y: Math.abs(rect2.top - rect1.top)
                        };

                        // Display measurement overlay
                        showMeasurements(distance);
                    }
                });

                document.addEventListener('click', (e) => {
                    if (!measuring) {
                        startElement = e.target;
                        measuring = true;
                    } else {
                        measuring = false;
                    }
                });
            }
        });
    },

    // Image Extraction
    extractImages: async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                const images = Array.from(document.images)
                    .map(img => ({
                        src: img.src,
                        alt: img.alt,
                        dimensions: `${img.naturalWidth}x${img.naturalHeight}`
                    }));
                return images;
            }
        });
    },

    // Website Crawler
    crawlWebsite: async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const url = new URL(tab.url);
        
        // Start crawling from the current domain
        const visited = new Set();
        const queue = [url.origin];
        const results = [];

        while (queue.length > 0) {
            const currentUrl = queue.shift();
            if (visited.has(currentUrl)) continue;
            
            visited.add(currentUrl);
            try {
                const response = await fetch(currentUrl);
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract links
                const links = Array.from(doc.links)
                    .map(link => link.href)
                    .filter(href => href.startsWith(url.origin));
                
                queue.push(...links);
                
                // Store page data
                results.push({
                    url: currentUrl,
                    title: doc.title,
                    content: html
                });
            } catch (error) {
                console.error(`Error crawling ${currentUrl}:`, error);
            }
        }
        
        return results;
    },

    // Code Comparison
    compareCode: async () => {
        // Store the first code selection
        if (!window.firstSelection) {
            window.firstSelection = selectedElement?.outerHTML;
            showNotification('First code selection stored. Select another element to compare.');
            return;
        }

        // Compare with second selection
        const secondSelection = selectedElement?.outerHTML;
        const diff = calculateDiff(window.firstSelection, secondSelection);
        showDiffDialog(diff);
        window.firstSelection = null;
    },

    // Export to CodePen
    exportToCodePen: async () => {
        if (!selectedElement) return;

        const html = selectedElement.outerHTML;
        const css = Array.from(document.styleSheets)
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');

        const data = {
            html: html,
            css: css,
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
};

// UI Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Quick action buttons
    document.querySelectorAll('.feature-item').forEach(item => {
        item.addEventListener('click', () => {
            const featureName = item.querySelector('span').textContent.toLowerCase().replace(/\s+/g, '');
            if (features[featureName]) {
                features[featureName]();
            }
        });
    });

    // Toggle inspector
    const toggleInspector = document.getElementById('toggleInspector');
    toggleInspector.addEventListener('click', () => {
        inspectorActive = !inspectorActive;
        toggleInspector.classList.toggle('text-green-600');
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: (active) => {
                    if (active) {
                        document.body.style.cursor = 'crosshair';
                        document.addEventListener('mouseover', highlightElement);
                        document.addEventListener('click', selectElement);
                    } else {
                        document.body.style.cursor = 'default';
                        document.removeEventListener('mouseover', highlightElement);
                        document.removeEventListener('click', selectElement);
                        removeHighlight();
                    }
                },
                args: [inspectorActive]
            });
        });
    });

    // Settings button
    document.getElementById('settingsBtn').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Help button
    document.getElementById('helpBtn').addEventListener('click', () => {
        window.open('https://codecraft.docs/guide', '_blank');
    });
});

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function calculateDiff(str1, str2) {
    // Simple diff implementation
    const lines1 = str1.split('\n');
    const lines2 = str2.split('\n');
    const diff = [];

    let i = 0, j = 0;
    while (i < lines1.length || j < lines2.length) {
        if (i >= lines1.length) {
            diff.push({ type: 'add', line: lines2[j] });
            j++;
        } else if (j >= lines2.length) {
            diff.push({ type: 'remove', line: lines1[i] });
            i++;
        } else if (lines1[i] === lines2[j]) {
            diff.push({ type: 'same', line: lines1[i] });
            i++;
            j++;
        } else {
            diff.push({ type: 'remove', line: lines1[i] });
            diff.push({ type: 'add', line: lines2[j] });
            i++;
            j++;
        }
    }

    return diff;
}

function showDiffDialog(diff) {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center';
    dialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h3 class="text-lg font-bold mb-4">Code Comparison</h3>
            <div class="font-mono text-sm">
                ${diff.map(d => `
                    <div class="${
                        d.type === 'add' ? 'bg-green-100' :
                        d.type === 'remove' ? 'bg-red-100' :
                        ''
                    } p-1">
                        <span class="mr-2">${
                            d.type === 'add' ? '+' :
                            d.type === 'remove' ? '-' :
                            ' '
                        }</span>
                        ${d.line}
                    </div>
                `).join('')}
            </div>
            <button class="mt-4 px-4 py-2 bg-gray-200 rounded" onclick="this.parentElement.parentElement.remove()">
                Close
            </button>
        </div>
    `;
    document.body.appendChild(dialog);
}

// Export functions for content script
window.CodeCraft = {
    features,
    showNotification
};
