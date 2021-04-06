
function sayContent() {
  risultato=document.body.innerText;
  //risultato="Twas brillig, and the slithy toves did gyre and gimbal in the wabe.";
  doNewTab(risultato);
}

function doNewTab(content){
  console.log("Publishing: "+content);
  chrome.runtime.sendMessage({op: "publish", data: String(content)}, {}, function(response) {
    console.log(response);
  });
}

sayContent();

