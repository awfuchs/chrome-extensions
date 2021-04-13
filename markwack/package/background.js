var sourceTab=0;
var sinkTab=0;
var mwOptions=restoreOptions();
var theContent="";

function reinitialize() {
  mwOptions=restoreOptions();
  sourceTab=0;
  sinkTab=0;
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
    sink_ready: {next: "hastab", func: enterHasTab},
    content_done: {next: "hascontent", func: enterHasContent}
  },
  hastab: {
    on_click: {next: "started", func: enterStarted},
    content_done: {next: "ready", func: enterReady}
  },
  hascontent: {
    on_click: {next: "started", func: enterStarted},
    sink_ready: {next: "ready", func: enterReady}
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
  console.log("Running enterStarted");
  setUpSourceTab(srctab.id);         // set up the source tab
  switch( mwOptions.outChannel ) {
    case "tab":
      startSinkOnNewTab();
      break;
    case "alert":
      startSinkOnSourceTab();
      break;
    default:
      console.error("Unknown outChannel option "+mwOptions.outChannel);
  }
}

function startSinkOnSourceTab() {
  chrome.tabs.sendMessage(
    sourceTab,
    { op: "areyoualive", data: "" }   // when there's no source tab
  );
}

function startSinkOnNewTab() {
  // create the sink tab ... result.html will send sink_ready
  // we do it this way to ensure the tab has spun up to a state where it can receive messages
  function cacheSinkTabID(tab) {
    sinkTab=tab.id;
    console.log("  sink tab ID="+sinkTab);
  }
  chrome.tabs.create( { url: "result.html" }, (tab) => cacheSinkTabID(tab));
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
  if( mwOptions.outChannel == "tab" ) {
    chrome.tabs.sendMessage( sinkTab, {op: "output", data: foo });
  }
  else if( mwOptions.outChannel == "alert" ) {
    chrome.tabs.sendMessage( sourceTab, {op: "output", data: foo });
  }
    
}

function enterDone() {
  console.log( "Running enterDone" );
  // activate the output tab
  chrome.tabs.activate(sinkTab);
  reinitialize();
}

function restoreOptions() {
  let o = {
    minParaLen: "1",
    maxParaLen: "6",
    outChannel: "alert"
  }
  function seto(i,j,k) {
    o.minParaLen=i;
    o.maxParaLen=j;
    o.outChannel=k;
  }

  chrome.storage.sync.get({
    minimumParagraphLength: '2',
    maximumParagraphLength: '4',
    outputChannel: 'alert'
    }, function(items) {
    //console.log(items);
    seto(items.minimumParagraphLength, items.maximumParagraphLength, items.outputChannel);
  });
  return o;
}



