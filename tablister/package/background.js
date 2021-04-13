var sourceTab;
var sinkTab;
var theTabGroups=[];


// = = = = = Listeners and handlers = = = = = 

chrome.action.onClicked.addListener((tab) => {
  handleClick( tab );
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    handleEvent( request.op, request.data );
  }
);

function handleClick(tab) {
  sourceTab=tab;            // sourceTab is the clicked one
  chrome.windows.create(
    {url: "result.html"},
    w => sinkTab=w.tabs[0]  // sinkTab is the one in the created window
  ) ;
}

function handleEvent(op, data) {
  if( op == "sink_ready" ) { askForTheTabGroups(sourceTab); }
}


// = = = = = The functional functions = = = = =

function askForTheTabGroups(tab) {
  wid=tab.windowId;
  chrome.tabGroups.query(
    {windowId: wid},
    groups => {
      if( chrome.runtime.lastError ) {
        console.error(chrome.runtime.lastError);
      }
      else {
	theTabGroups=groups;
	listWindowContaining(tab); // do you get the feeling this should all be much more promise-y?
      }
    }
  )
}


function listWindowContaining(tab) {
  getTabsGroups(tab)
  .then( them => loadTheGroups(them) )
  .then( blob => outputThe(blob) )
  .catch( err => console.error(err) );
}


async function getTabsGroups(tab) {
  var theTabs = {};
  var iTab, winTabs, response;
  let wid = tab.windowId;
  windowDetails = await chrome.windows.get( wid, { populate: true } );
  winTabs=windowDetails.tabs;
  for( i=0; i<winTabs.length; i++ ) {
    iTab = winTabs[i];
    theTabs[iTab.id] = {
      title: iTab.title,
      groupId: iTab.groupId
    }
  }
  return theTabs;
}


async function loadTheGroups(theTabs) {
  var theGroups = {};
  function recordTabInGroup(tab, group) {
    if( !(group in theGroups) ) { theGroups[group]=[]; }
    theGroups[group].push(tab);
  }
  for( tabid in theTabs ) {
    var thisTab=theTabs[tabid]
    var tabTitle=thisTab.title;
    var gid=theTabs[tabid].groupId;
    var groupTitle;
    if(gid == -1) {
      groupTitle = "Not in any group";
    }
    else {
      for( tg=0; tg<theTabGroups.length; tg++ ) {
        if(theTabGroups[tg].id==gid) {
          groupTitle=theTabGroups[tg].title;
          break;
        }
      }
    }
    recordTabInGroup(tabTitle,groupTitle);
    for( n in theGroups ) {
      theGroups[n].sort();
    }
  }
  return theGroups;
}

function noutputThe( blob ) {
  for( g in blob ) {
    console.log( ">>> "+g+" <<<");
    for( t=0; t<blob[g].length; t++ ) {
      console.log( blob[g][t] );
    }
  }
}

function outputThe( blob ) {
  blobcollector="";
  function emit(s) { blobcollector += s+"\n"; }

  for( g in blob ) {
    emit( "<h2>"+g+"</h2><ul>");
    for( t=0; t<blob[g].length; t++ ) {
      emit( "<li>"+blob[g][t]+"</li>" );
    }
    emit("</ul>");
  }
  console.log( blobcollector );
  chrome.tabs.sendMessage(
    sinkTab.id,
    {op: "output", data: blobcollector }
  );
}

