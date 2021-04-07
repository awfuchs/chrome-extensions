chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.op == "makecontent")
      sendResponse({ content: String(sayContent()) });
  }
);


function sayContent() {
  risultato=document.body.innerText;
  return risultato;
}

