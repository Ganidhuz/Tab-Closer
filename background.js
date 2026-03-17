// Listen for tab updates (e.g., URL change, title update)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.title || changeInfo.url) {
    checkAndCloseTab(tabId, tab);
  }
});

// Listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  // Sometimes a new tab might not have a URL/title immediately, 
  // but it's good to check just in case.
  if (tab.id) {
    checkAndCloseTab(tab.id, tab);
  }
});

function checkAndCloseTab(tabId, tab) {
  // If we don't have enough info, skip
  if (!tab || (!tab.title && !tab.url)) return;

  chrome.storage.sync.get(['keywords'], function(result) {
    const keywords = result.keywords || [];
    
    if (keywords.length === 0) return;

    const title = (tab.title || '').toLowerCase();
    const url = (tab.url || '').toLowerCase();

    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      if (title.includes(lowerKeyword) || url.includes(lowerKeyword)) {
        console.log(`Closing tab ${tabId} because it matched keyword: ${keyword}`);
        chrome.tabs.remove(tabId, () => {
          if (chrome.runtime.lastError) {
            // Tab might have been closed already or doesn't exist
            console.log("Tab closed or invalid:", chrome.runtime.lastError.message);
          }
        });
        break; // Stop checking after first match
      }
    }
  });
}
