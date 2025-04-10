// Main JavaScript functionality for CodeCraft

// Error handling utility
const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded shadow-lg fade-in';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
};

// Success message utility
const showSuccess = (message) => {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg fade-in';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
};

// API call utility
const makeAPICall = async (endpoint, method = 'GET', data = null) => {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        showError(`API Error: ${error.message}`);
        throw error;
    }
};

// Store extracted code globally
window.extractedCode = {
    html: '',
    css: '',
    js: ''
};

// Code extraction functionality
const extractCode = async (url) => {
    try {
        const data = await makeAPICall(`http://localhost:3000/api/extract?url=${encodeURIComponent(url)}`, 'GET');
        // Store the extracted code globally
        window.extractedCode = {
            html: data.html || '',
            css: data.css || '',
            js: data.js || ''
        };
        return data;
    } catch (error) {
        showError('Failed to extract code from the provided URL');
        return null;
    }
};

// Copy to clipboard utility
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showSuccess('Copied to clipboard!');
    } catch (err) {
        showError('Failed to copy to clipboard');
    }
};

// Download file utility
const downloadFile = (filename, content) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

// Update code display based on selected tab
const updateCodeDisplay = (tab) => {
    const codeDisplay = document.querySelector('#codeDisplay');
    if (!codeDisplay) return;

    switch(tab) {
        case 'html':
            codeDisplay.textContent = window.extractedCode.html;
            codeDisplay.className = 'language-html';
            break;
        case 'css':
            codeDisplay.textContent = window.extractedCode.css;
            codeDisplay.className = 'language-css';
            break;
        case 'js':
            codeDisplay.textContent = window.extractedCode.js;
            codeDisplay.className = 'language-javascript';
            break;
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Extract button functionality
    const extractButton = document.querySelector('#extractButton');
    const resultsSection = document.querySelector('#resultsSection');
    
    if (extractButton) {
        extractButton.addEventListener('click', async () => {
            const urlInput = document.querySelector('#url');
            if (!urlInput.value) {
                showError('Please enter a valid URL');
                return;
            }
            
            try {
                extractButton.disabled = true;
                extractButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Extracting...';
                
                const result = await extractCode(urlInput.value);
                if (result) {
                    showSuccess('Code extracted successfully!');
                    // Show results section and update HTML tab by default
                    resultsSection.classList.remove('hidden');
                    updateCodeDisplay('html');
                }
            } catch (error) {
                showError('Failed to extract code');
            } finally {
                extractButton.disabled = false;
                extractButton.innerHTML = '<i class="fas fa-code mr-2"></i>Extract Code';
            }
        });
    }

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('[data-tab]');
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                
                // Update active tab styling
                tabButtons.forEach(btn => {
                    btn.classList.remove('border-indigo-500', 'text-indigo-600');
                    btn.classList.add('border-transparent', 'text-gray-500');
                });
                e.target.classList.remove('border-transparent', 'text-gray-500');
                e.target.classList.add('border-indigo-500', 'text-indigo-600');
                
                // Update code display
                updateCodeDisplay(tab);
            });
        });
    }

    // Copy button functionality
    const copyButton = document.querySelector('#copyButton');
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const codeDisplay = document.querySelector('#codeDisplay');
            if (codeDisplay) {
                copyToClipboard(codeDisplay.textContent);
            }
        });
    }

    // Download button functionality
    const downloadButton = document.querySelector('#downloadButton');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            const codeDisplay = document.querySelector('#codeDisplay');
            const activeTab = document.querySelector('[data-tab].border-indigo-500').dataset.tab;
            if (codeDisplay) {
                const extension = activeTab === 'js' ? '.js' : activeTab === 'css' ? '.css' : '.html';
                downloadFile(`extracted-code${extension}`, codeDisplay.textContent);
            }
        });
    }
});
