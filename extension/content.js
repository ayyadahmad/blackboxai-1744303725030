// Global state
let highlightOverlay = null;
let measureOverlay = null;
let selectedElements = new Set();

// Styles for highlighted elements
const highlightStyles = {
    border: '2px solid #4f46e5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 10000
};

// Create highlight overlay
function createHighlightOverlay() {
    if (highlightOverlay) return;
    
    highlightOverlay = document.createElement('div');
    Object.assign(highlightOverlay.style, highlightStyles);
    document.body.appendChild(highlightOverlay);
}

// Update highlight position
function updateHighlight(element) {
    if (!highlightOverlay) return;
    
    const rect = element.getBoundingClientRect();
    Object.assign(highlightOverlay.style, {
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
    });
}

// Remove highlight
function removeHighlight() {
    if (highlightOverlay) {
        highlightOverlay.remove();
        highlightOverlay = null;
    }
}

// Element selection handler
function handleElementSelection(event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;
    selectedElements.add(element);

    // Show context menu
    showContextMenu(event.clientX, event.clientY, element);
}

// Context menu creation
function showContextMenu(x, y, element) {
    removeContextMenu(); // Remove any existing context menu

    const menu = document.createElement('div');
    menu.id = 'codecraft-context-menu';
    menu.className = 'codecraft-context-menu';
    menu.style.cssText = `
        position: fixed;
        top: ${y}px;
        left: ${x}px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 4px 0;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10001;
    `;

    const menuItems = [
        { icon: 'clone', text: 'Clone Element', action: () => cloneElement(element) },
        { icon: 'code', text: 'Copy HTML', action: () => copyHTML(element) },
        { icon: 'paint-brush', text: 'Copy CSS', action: () => copyCSS(element) },
        { icon: 'file-export', text: 'Export to CodePen', action: () => exportToCodePen(element) },
        { icon: 'ruler', text: 'Measure', action: () => startMeasuring(element) },
        { icon: 'trash', text: 'Remove', action: () => element.remove() }
    ];

    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'codecraft-context-menu-item';
        menuItem.style.cssText = `
            padding: 8px 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
        `;
        menuItem.innerHTML = `
            <i class="fas fa-${item.icon}" style="width: 16px;"></i>
            <span>${item.text}</span>
        `;
        menuItem.addEventListener('click', () => {
            item.action();
            removeContextMenu();
        });
        menuItem.addEventListener('mouseover', () => {
            menuItem.style.backgroundColor = '#f3f4f6';
        });
        menuItem.addEventListener('mouseout', () => {
            menuItem.style.backgroundColor = 'transparent';
        });
        menu.appendChild(menuItem);
    });

    document.body.appendChild(menu);

    // Close menu when clicking outside
    document.addEventListener('click', removeContextMenu, { once: true });
}

// Remove context menu
function removeContextMenu() {
    const menu = document.getElementById('codecraft-context-menu');
    if (menu) menu.remove();
}

// Feature implementations
function cloneElement(element) {
    const clone = element.cloneNode(true);
    element.parentNode.insertBefore(clone, element.nextSibling);
    chrome.runtime.sendMessage({ type: 'showNotification', message: 'Element cloned successfully!' });
}

function copyHTML(element) {
    const html = element.outerHTML;
    navigator.clipboard.writeText(html);
    chrome.runtime.sendMessage({ type: 'showNotification', message: 'HTML copied to clipboard!' });
}

function copyCSS(element) {
    const styles = window.getComputedStyle(element);
    let css = element.tagName.toLowerCase() + ' {\n';
    for (let prop of styles) {
        css += `    ${prop}: ${styles.getPropertyValue(prop)};\n`;
    }
    css += '}';
    navigator.clipboard.writeText(css);
    chrome.runtime.sendMessage({ type: 'showNotification', message: 'CSS copied to clipboard!' });
}

function exportToCodePen(element) {
    const html = element.outerHTML;
    const styles = window.getComputedStyle(element);
    let css = element.tagName.toLowerCase() + ' {\n';
    for (let prop of styles) {
        css += `    ${prop}: ${styles.getPropertyValue(prop)};\n`;
    }
    css += '}';

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

// Measurement functionality
function startMeasuring(element) {
    if (measureOverlay) return;

    measureOverlay = document.createElement('div');
    measureOverlay.className = 'codecraft-measure-overlay';
    measureOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 10000;
    `;

    const rect = element.getBoundingClientRect();
    const dimensions = document.createElement('div');
    dimensions.style.cssText = `
        position: absolute;
        background: rgba(79, 70, 229, 0.9);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-family: monospace;
        pointer-events: none;
    `;
    dimensions.textContent = `${Math.round(rect.width)}px × ${Math.round(rect.height)}px`;
    dimensions.style.top = `${rect.top + window.scrollY - 24}px`;
    dimensions.style.left = `${rect.left + window.scrollX}px`;

    measureOverlay.appendChild(dimensions);
    document.body.appendChild(measureOverlay);

    setTimeout(() => {
        if (measureOverlay) {
            measureOverlay.remove();
            measureOverlay = null;
        }
    }, 3000);
}

// Message handling from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'startInspecting':
            document.addEventListener('mouseover', updateHighlight);
            document.addEventListener('click', handleElementSelection);
            createHighlightOverlay();
            break;
        case 'stopInspecting':
            document.removeEventListener('mouseover', updateHighlight);
            document.removeEventListener('click', handleElementSelection);
            removeHighlight();
            break;
    }
});

// Initialize styles
const style = document.createElement('style');
style.textContent = `
    .codecraft-context-menu {
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        line-height: 1.5;
    }
    .codecraft-context-menu-item:hover {
        background-color: #f3f4f6;
    }
`;
document.head.appendChild(style);
