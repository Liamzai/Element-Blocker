// Create context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "blockElement",
        title: "Block this element",
        contexts: ["all"]
    });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "blockElement") {
        chrome.tabs.sendMessage(tab.id, {
            action: "blockElement"
        });
    }
});