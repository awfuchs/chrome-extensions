// --- Listener for incoming messages ---
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.op == "hello" ) {
      sendResponse({farewell:"goodbye"});
      console.log("Hello from the message listener!");
    } else if( request.op == "publish" ) {
      sendResponse({farewell:"goodbye"});
      //console.log( request.data );
      outputToTab( request.data );
    }
  }
);

// --- Listener for icon click ---
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['saycontent.js'],
  });
});

function outputToTab(content) {
  chrome.tabs.create( {active: false, url: "result.html"} )
  .then( tab => injectScript(tab.id) )
  .catch( err => console.log(err) );
  
}

function injectScript(id) {
  chrome.scripting.executeScript(
    { target: { tabId: id }, files: ['selfout.js'],  },
    (results) => {
      if(chrome.runtime.lastError) { console.error(chrome.runtime.lastError); }
      else { (results) => console.log(results); }
    }
  )
}

function updateContent(id, content) {
  chrome.scripting.executeScript(
    { target: { tabId: id }, files: ['selfout.js'], }
  )
  .then( results => chrome.tabs.sendMessage( id, {content: String(content)}, {} ) )
  //.then( response => {console.log(response)} )
  .catch( err => {console.error(err)} );
}


