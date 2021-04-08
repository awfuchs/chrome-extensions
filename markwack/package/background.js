var sourceTab=0;
var sinkTab=0;
options={outputWhere: "tab"};
var theContent="";

function reinitialize() {
  sourceTab=0;
  sinkTab=0;
  options={outputWhere: "tab"};
  theContent="";
}
/*
 * The state machine. A state table, an event handler to do state transitions
 * and call state-entry functions.
 */

var currentState="none";

// --- The state table. Note click in any state restarts ---

var stateTable= {
  none: {
    on_click: {next: "started", func: enterStarted}
  },
  started: {
    on_click: {next: "started", func: enterStarted},
    tab_done: {next: "hastab", func: enterHasTab},
    content_done: {next: "hascontent", func: enterHasContent}
  },
  hastab: {
    on_click: {next: "started", func: enterStarted},
    content_done: {next: "ready", func: enterReady}
  },
  hascontent: {
    on_click: {next: "started", func: enterStarted},
    tab_done: {next: "ready", func: enterReady}
  },
  ready: {
    on_click: {next: "started", func: enterStarted},
    do_output: {next: "done", func: enterDone}
  },
  done: {
    on_click: {next: "started", func: enterStarted}
  }
}

function handleEvent( event, data ) {
  if( event in stateTable[currentState] ) {
    console.log( "Currently in "+currentState+" state; received event "+event);
    let nextState=stateTable[currentState][event].next;
    stateTable[currentState][event]["func"](data);
    currentState=nextState;
  }
  else {
    console.log( "(ignore "+event+" not valid in state "+currentState+")");
  }
}


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
    console.log("  sink tab ID="+sinkTab);
  }
  console.log( "Running enterStarted; source tab ID="+srctab.id);
  setUpSourceTab(srctab.id);         // set up the source tab
  chrome.tabs.create( {              // create the sink tab
      //active: false,
      url: "result.html"             // result.html invokes selfout.js
    },
    (tab) => cacheSinkTabID(tab)
  );
}

function enterHasTab(foo) {
  // Poke the source page now. Moved here from enterStarted
  // to provide more timing slack...

  console.log( "Running enterHasTab");
  chrome.tabs.sendMessage(           // ask the source tab for content
    sourceTab,
    {op: "create", data: "" }
  );
}

function enterHasContent(content) {
  console.log( "Running enterHasContent, with this content:" );
  console.log( content );
  theContent = content;              // cache the content
}

function enterReady(foo) {
  console.log( "Running enterReady" );
  // send content to output tab
  chrome.tabs.sendMessage( sinkTab, {op: "output", data: foo });
}

function enterDone() {
  console.log( "Running enterDone" );
  // activate the output tab
  chrome.tabs.activate(sinkTab);
  reinitialize();
}

