var srcTab=0;
options={outputWhere: "tab"};
var currentState="none";
var theContent="";

var stateTable= {
  none: {
    on_click: {next: "started", func: enterStarted}
  },
  started: {
    tab_done: {next: "hastab", func: enterHasTab},
    content_done: {next: "hascontent", func: enterHasContent}
  },
  hastab: {
    content_done: {next: "ready", func: enterReady}
  },
  hascontent: {
    tab_done: {next: "ready", func: enterReady}
  },
  ready: {
    do_output: {next: "done", func: enterDone}
  }
}

chrome.action.onClicked.addListener((tab) => {
  handleEvent("on_click");
  handleEvent("content_done");
  handleEvent("content_done");
  handleEvent("tab_done");
  handleEvent("tab_done");
  handleEvent("tab_done");
  handleEvent("do_output");
  currentState="none";
  handleEvent("on_click");
  handleEvent("tab_done");
  handleEvent("tab_done");
  handleEvent("do_output");
  handleEvent("on_click");
  handleEvent("content_done");
  handleEvent("do_output");
});

/*
// --- Listener for icon click ---
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['saycontent.js'], });
  doTheThings( tab.id );
});
*/

function doTheThings( tabid ) {
  switch(options.outputWhere) {
    case "console":
      //not implemented
      break;
    case "alert":
      //not implemented
      break;
    case "tab":
      scrTab=tabid; // need to persist this for later, sadly
      chrome.tabs.create( {active: false, url: "result.html"} );
  }
}

/*
function getTheContent() {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage( scrTab, {op: "makecontent"}, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return reject(chrome.runtime.lastError);
      }
      resolve(response);
    });
  });
}
*/

async function getTheContent() {
  let x = await chrome.tabs.sendMessage( scrTab, {op: "makecontent"} );
  return x.content;
}

async function returnTheContent() {
  let content = await getTheContent();
  return content;
}

// --- Listener for incoming messages ---
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.op == "fetchtext" ) {
      sendResponse( { text: String(returnTheContent()) } );
    }
  }
);

function enterStarted() {
  // create the output tab
  // cache its tab id
  // request the content
}

function enterHasTab() {
  // no-op
}

function enterHasContent() {
  // cache the content
}

function enterReady() {
  // send content to output tab
}

function enterDone() {
  // activate the ouput tab
}


function handleEvent( event ) {
  if( event in stateTable[currentState] ) {
    stateTable[currentState][event]["func"]();
    currentState=stateTable[currentState][event].next;
  }
  else {
    console.log( "(ignore "+event+" not valid in state "+currentState);
  }
}

