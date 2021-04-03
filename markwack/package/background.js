chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      sendResponse({farewell:"goodbye"});
  }
);

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['saycontent.js'],
  });
});



