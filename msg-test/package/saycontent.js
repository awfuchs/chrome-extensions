
function sayContent() {
  risultato=document.body.innerText;
  doNewTab(risultato);
}

function doNewTab(content){
  console.log("Publishing: "+content);
  chrome.runtime.sendMessage({op: "publish", data: String(content)}, {}, function(response) {
    console.log(response);
  });
}

sayContent();

