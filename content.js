let selectedElement = null;
let blockedElements = new Set();
let originalStyles = new Map(); 

// Create context menu item
document.addEventListener('contextmenu', function(event) {
    selectedElement = event.target;
});

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'blockElement' && selectedElement) {
        blockElement(selectedElement);
    }
    if (message.action === 'updateBlockedElements') {
        updateBlockedElements(message.blockedSelectors);
    }
});

// Function to block an element
function blockElement(element) {
    if (element) {
        // Save original display style
        if (!originalStyles.has(element)) {
            originalStyles.set(element, element.style.display || '');
        }
        element.style.display = 'none';
        // Save the selector of the blocked element
        const selector = generateSelector(element);
        blockedElements.add(selector);
        // Save to storage
        chrome.storage.local.set({
            blockedSelectors: Array.from(blockedElements)
        });
    }
}

// Update blocked elements
function updateBlockedElements(selectors) {
    // First restore all previously blocked elements
    blockedElements.forEach(oldSelector => {
        const elements = document.querySelectorAll(oldSelector);
        elements.forEach(el => {
            const originalStyle = originalStyles.get(el) || '';
            el.style.display = originalStyle;
        });
    });

    // Update the blocked list
    blockedElements = new Set(selectors);

    // Apply new blocking rules
    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (!originalStyles.has(el)) {
                originalStyles.set(el, el.style.display || '');
            }
            el.style.display = 'none';
        });
    });
}

// Generate a unique selector for an element
function generateSelector(element) {
    if (element.id) {
        return `#${element.id}`;
    }
    
    let selector = element.tagName.toLowerCase();
    if (element.className) {
        const classes = element.className.split(' ')
            .filter(c => c)
            .map(c => `.${c}`)
            .join('');
        selector += classes;
    }
    
    return selector;
}

// Apply saved blocking rules when the page loads
chrome.storage.local.get(['blockedSelectors'], function(result) {
    if (result.blockedSelectors) {
        blockedElements = new Set(result.blockedSelectors);
        blockedElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!originalStyles.has(el)) {
                    originalStyles.set(el, el.style.display || '');
                }
                el.style.display = 'none';
            });
        });
    }
});

// Monitor page changes to handle dynamically loaded elements
const observer = new MutationObserver((mutations) => {
    if (blockedElements.size > 0) {
        blockedElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (!originalStyles.has(el)) {
                    originalStyles.set(el, el.style.display || '');
                }
                el.style.display = 'none';
            });
        });
    }
});

// Start observing DOM changes
observer.observe(document.body, {
    childList: true,
    subtree: true
});