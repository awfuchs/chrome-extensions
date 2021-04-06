// --- Listener for icon click ---
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['saycontent.js'],
  });
});

// --- Listener for incoming messages ---
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.op == "publish" ) {
      console.log( "Received request: " + request.data );
      outputToTab( request.data );
    }
  }
);

function outputToTab(content) {
  chrome.tabs.create( {active: false, url: "result.html"} )
  .then( tab =>
    {
      //injectScript(tab.id);
      updateContent(tab.id, content)
    })
  .catch( err => console.log(err) );
}

function injectScript(id) {
  chrome.scripting.executeScript(
    { target: { tabId: id }, files: ['selfout.js'],  },
    (results) => {
      if(chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
      else {
        console.log("Results object from executeScript...");
        (results) => console.log(results);
      }
    }
  )
}

function updateContent(id, content) {
  chrome.tabs.sendMessage( id, {content: String(content)}, {} )
}


