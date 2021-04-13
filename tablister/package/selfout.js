
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if ( request.op == "output" ) { doOutput(request.data); }
  }
);

chrome.runtime.sendMessage( {op: "sink_ready", data: ""} );

function doOutput(content) {
  document.body.innerHTML=content;
}

