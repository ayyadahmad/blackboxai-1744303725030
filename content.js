// Global state
let isExtensionActive = false;
let selectedElement = null;
let liveEditMode = false;
let originalStyles = null;

// Keyboard shortcuts
const SHORTCUTS = {
    toggleExtension: 'Alt+Shift+C',
    copyElement: 'Alt+Shift+X',
    colorPicker: 'Alt+Shift+P',
    fontInfo: 'Alt+Shift+F',
    liveEdit: 'Alt+Shift+E'
};

// Initialize extension
function initializeExtension() {
    createOverlay();
    setupKeyboardShortcuts();
    injectStyleEditor();
    setupContextMenu();
}

// Create overlay for element highlighting
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'codecraft-overlay';
    overlay.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 999999;
        border: 2px solid #4f46e5;
        background: rgba(79, 70, 229, 0.1);
        display: none;
    `;
    document.body.appendChild(overlay);
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case 'c': toggleExtension(); break;
                case 'x': copySelectedElement(); break;
                case 'p': activateColorPicker(); break;
                case 'f': showFontInfo(); break;
                case 'e': toggleLiveEdit(); break;
            }
        }
    });
}

// Toggle extension activation
function toggleExtension() {
    isExtensionActive = !isExtensionActive;
    if (isExtensionActive) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', handleClick);
    } else {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        hideOverlay();
    }
    showNotification(`Extension ${isExtensionActive ? 'activated' : 'deactivated'}`);
}

// Handle mouse movement for element highlighting
function handleMouseMove(e) {
    if (!isExtensionActive) return;
    
    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element) return;

    const overlay = document.getElementById('codecraft-overlay');
    const rect = element.getBoundingClientRect();
    
    overlay.style.display = 'block';
    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;

    // Show element info tooltip
    showElementInfo(element, e);
}

// Show element information tooltip
function showElementInfo(element, event) {
    const computedStyle = window.getComputedStyle(element);
    const tooltip = document.getElementById('codecraft-tooltip') || createTooltip();
    
    tooltip.innerHTML = `
        <div class="font-info">
            Font: ${computedStyle.fontFamily}
            Size: ${computedStyle.fontSize}
            Weight: ${computedStyle.fontWeight}
        </div>
        <div class="color-info">
            Color: ${computedStyle.color}
            Background: ${computedStyle.backgroundColor}
        </div>
        <div class="size-info">
            Size: ${element.offsetWidth}x${element.offsetHeight}
        </div>
    `;

    positionTooltip(tooltip, event);
}

// Create tooltip element
function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'codecraft-tooltip';
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 999999;
        pointer-events: none;
    `;
    document.body.appendChild(tooltip);
    return tooltip;
}

// Position tooltip near cursor
function positionTooltip(tooltip, event) {
    const offset = 15;
    tooltip.style.top = `${event.clientY + offset}px`;
    tooltip.style.left = `${event.clientX + offset}px`;
}

// Handle element click for selection
function handleClick(e) {
    if (!isExtensionActive) return;
    e.preventDefault();
    
    selectedElement = document.elementFromPoint(e.clientX, e.clientY);
    if (!selectedElement) return;

    showContextMenu(e.clientX, e.clientY);
}

// Create and show context menu
function showContextMenu(x, y) {
    const menu = document.createElement('div');
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
        z-index: 1000000;
    `;

    const actions = [
        { icon: 'copy', text: 'Copy Element', action: copySelectedElement },
        { icon: 'edit', text: 'Live Edit', action: toggleLiveEdit },
        { icon: 'eyedropper', text: 'Pick Color', action: activateColorPicker },
        { icon: 'font', text: 'Font Info', action: showFontInfo },
        { icon: 'code', text: 'Copy Code', action: copyElementCode },
        { icon: 'download', text: 'Export', action: exportElement }
    ];

    actions.forEach(({ icon, text, action }) => {
        const item = createMenuItem(icon, text, action);
        menu.appendChild(item);
    });

    document.body.appendChild(menu);
    document.addEventListener('click', () => menu.remove(), { once: true });
}

// Create menu item
function createMenuItem(icon, text, action) {
    const item = document.createElement('div');
    item.className = 'codecraft-context-menu-item';
    item.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${text}</span>
    `;
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        action();
    });
    return item;
}

// Copy selected element
function copySelectedElement() {
    if (!selectedElement) return;
    
    const clone = selectedElement.cloneNode(true);
    const styles = getComputedStyles(selectedElement);
    
    // Store in extension storage
    chrome.storage.local.set({
        copiedElement: {
            html: clone.outerHTML,
            styles: styles
        }
    });
    
    showNotification('Element copied to clipboard!');
}

// Get computed styles
function getComputedStyles(element) {
    const computed = window.getComputedStyle(element);
    const styles = {};
    
    for (let prop of computed) {
        styles[prop] = computed.getPropertyValue(prop);
    }
    
    return styles;
}

// Activate color picker
function activateColorPicker() {
    const eyeDropper = new EyeDropper();
    eyeDropper.open()
        .then(result => {
            navigator.clipboard.writeText(result.sRGBHex);
            showNotification(`Color copied: ${result.sRGBHex}`);
        })
        .catch(err => console.log(err));
}

// Show font information
function showFontInfo() {
    if (!selectedElement) return;
    
    const computed = window.getComputedStyle(selectedElement);
    const fontInfo = {
        family: computed.fontFamily,
        size: computed.fontSize,
        weight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing
    };
    
    showFontInfoDialog(fontInfo);
}

// Show font information dialog
function showFontInfoDialog(fontInfo) {
    const dialog = document.createElement('div');
    dialog.className = 'codecraft-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <h3>Font Information</h3>
            <div class="font-details">
                <p>Family: ${fontInfo.family}</p>
                <p>Size: ${fontInfo.size}</p>
                <p>Weight: ${fontInfo.weight}</p>
                <p>Line Height: ${fontInfo.lineHeight}</p>
                <p>Letter Spacing: ${fontInfo.letterSpacing}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(dialog);
}

// Toggle live edit mode
function toggleLiveEdit() {
    if (!selectedElement) return;
    
    liveEditMode = !liveEditMode;
    if (liveEditMode) {
        originalStyles = selectedElement.getAttribute('style');
        makeElementEditable(selectedElement);
    } else {
        makeElementUneditable(selectedElement);
    }
    
    showNotification(`Live Edit Mode ${liveEditMode ? 'enabled' : 'disabled'}`);
}

// Make element editable
function makeElementEditable(element) {
    element.contentEditable = true;
    element.style.cursor = 'text';
    element.style.outline = '2px solid #4f46e5';
    
    // Add style controls
    addStyleControls(element);
}

// Add style controls
function addStyleControls(element) {
    const controls = document.createElement('div');
    controls.className = 'codecraft-style-controls';
    controls.innerHTML = `
        <div class="control-group">
            <label>Font Size</label>
            <input type="range" min="8" max="72" value="16" data-style="fontSize">
        </div>
        <div class="control-group">
            <label>Color</label>
            <input type="color" data-style="color">
        </div>
        <div class="control-group">
            <label>Background</label>
            <input type="color" data-style="backgroundColor">
        </div>
        <div class="control-group">
            <label>Padding</label>
            <input type="range" min="0" max="50" value="0" data-style="padding">
        </div>
    `;
    
    // Add event listeners
    controls.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const style = e.target.dataset.style;
            const value = e.target.type === 'range' ? `${e.target.value}px` : e.target.value;
            element.style[style] = value;
        });
    });
    
    document.body.appendChild(controls);
}

// Make element uneditable
function makeElementUneditable(element) {
    element.contentEditable = false;
    element.style.cursor = '';
    element.style.outline = '';
    
    // Remove style controls
    const controls = document.querySelector('.codecraft-style-controls');
    if (controls) controls.remove();
    
    // Restore original styles or keep changes
    if (originalStyles) {
        element.setAttribute('style', originalStyles);
    }
}

// Copy element code
function copyElementCode() {
    if (!selectedElement) return;
    
    const html = selectedElement.outerHTML;
    const styles = getComputedStyles(selectedElement);
    const css = generateCSS(selectedElement, styles);
    
    const code = `<!-- HTML -->
${html}

/* CSS */
${css}`;
    
    navigator.clipboard.writeText(code);
    showNotification('Code copied to clipboard!');
}

// Generate CSS from computed styles
function generateCSS(element, styles) {
    const selector = generateSelector(element);
    let css = `${selector} {\n`;
    
    for (let prop in styles) {
        if (styles[prop] && styles[prop] !== 'initial') {
            css += `    ${prop}: ${styles[prop]};\n`;
        }
    }
    
    css += '}';
    return css;
}

// Generate CSS selector
function generateSelector(element) {
    let selector = element.tagName.toLowerCase();
    if (element.id) {
        selector += `#${element.id}`;
    } else if (element.className) {
        selector += `.${element.className.split(' ').join('.')}`;
    }
    return selector;
}

// Export element
function exportElement() {
    if (!selectedElement) return;
    
    const html = selectedElement.outerHTML;
    const styles = getComputedStyles(selectedElement);
    
    // Create download link
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'element.html';
    a.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    showNotification('Element exported!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'codecraft-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Initialize extension
initializeExtension();
