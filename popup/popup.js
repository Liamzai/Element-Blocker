document.addEventListener('DOMContentLoaded', function() {
    updateBlockedList();
});

function updateBlockedList() {
    const blockedList = document.getElementById('blockedList');
    blockedList.innerHTML = '';

    chrome.storage.local.get(['blockedSelectors'], function(result) {
        if (result.blockedSelectors && result.blockedSelectors.length > 0) {
            result.blockedSelectors.forEach(selector => {
                const item = document.createElement('div');
                item.className = 'blocked-item';
                
                const text = document.createElement('span');
                text.textContent = selector;
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.textContent = 'Remove';
                removeBtn.onclick = () => removeBlockedElement(selector);
                
                item.appendChild(text);
                item.appendChild(removeBtn);
                blockedList.appendChild(item);
            });
        } else {
            blockedList.appendChild(document.createTextNode('No blocked elements'));
        }
    });
}

function removeBlockedElement(selector) {
    chrome.storage.local.get(['blockedSelectors'], function(result) {
        const blockedSelectors = result.blockedSelectors || [];
        const newSelectors = blockedSelectors.filter(s => s !== selector);
        
        chrome.storage.local.set({
            blockedSelectors: newSelectors
        }, function() {
            updateBlockedList();
            // Notify the current tab to update
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateBlockedElements',
                    blockedSelectors: newSelectors
                });
            });
        });
    });
}