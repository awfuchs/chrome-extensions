console.log("New tab content script running to load message listener");

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    alert("New tab got request with some content...");
    document.body.innerText=request.content;
    function (sendResponse) {console.log(sendResponse)};
  }
);
