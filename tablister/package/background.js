// --- Listener for icon click ---
chrome.action.onClicked.addListener((tab) => {
  askForTheTabGroups( tab );
});

var sourceTab=0;
var theTabGroups=[];

function askForTheTabGroups(tab) {
  sourceTab=tab;
  wid=tab.windowId;
  chrome.tabGroups.query(
    {windowId: wid},
    groups => {
      theTabGroups=groups;
      listWindowContaining(sourceTab);
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
  }
  return theGroups;
}

function outputThe( blob ) {
  for( g in blob ) {
    console.log( ">>> "+g+" <<<");
    for( t=0; t<blob[g].length; t++ ) {
      console.log( blob[g][t] );
    }
  }
}

