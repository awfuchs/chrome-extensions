var sourceTab=0;
var sinkTab=0;
options={outputWhere: "tab"};
var theContent="";

/*
 * The state machine. A state table, an event handler to do state transitions
 * and call state-entry functions.
 */

var currentState="none";

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
  },
  done: {
    // Allow new click after cycle completes
    on_click: {next: "started", func: enterStarted}
  }
}

function handleEvent( event, data ) {
  if( event in stateTable[currentState] ) {
    stateTable[currentState][event]["func"](data);
    currentState=stateTable[currentState][event].next;
  }
  else {
    console.log( "(ignore "+event+" not valid in state "+currentState);
  }
}

/*
// alternate listener for testing state transitions
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
*/


/*
 * The listeners: one for user click, another for messages
 * from the tabs.
 */

// --- Listener for incoming messages ---
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    handleEvent( request.op, request.data );
  }
);

// --- Listener for icon click ---
chrome.action.onClicked.addListener((tab) => {
  handleEvent( "on_click", tab );
});

function setUpSourceTab(tabid) {
  // source tab: cache id and inject content script
  sourceTab=tabid;
  chrome.scripting.executeScript({
    target: { tabId: tabid },
    files: ['saycontent.js'],
  });
}

/*
 * The state-entry functions. These are invoked on transition to the
 * corresponding state. (Could be implemented as a function table instead...)
 */

function enterStarted(srctab) {
  function cacheSinkTabID(tab) {
    sinkTab=tab.id;
  }
  setUpSourceTab(srctab.id);         // set up the source tab
  chrome.tabs.create( {              // create the sink tab
      active: false,
      url: "result.html"
    },
    (tab) => cacheSinkTabID(tab)
  );
  chrome.tabs.sendMessage(           // ask the source tab for content
    sourceTab,
    {op: "create", data: "" }
  );
}

function enterHasTab(foo) {
  // no-op: this state just registers
  // that the sink page is alive
}

function enterHasContent(content) {
  theContent = content;              // cache the content
}

function enterReady(content) {
  // send content to output tab
  chrome.tabs.sendMessage( sinkTab, {op: "create", data: "" });
}

function enterDone() {
  // activate the ouput tab
}

