chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.op == "hello" ) {
      sendResponse({farewell:"goodbye"});
      console.log("Hello from the message listener!");
    } else if( request.op == "publish" ) {
      sendResponse({farewell:"goodbye"});
      console.log( request.data );
    }
  }
);

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['saycontent.js'],
  });
});



