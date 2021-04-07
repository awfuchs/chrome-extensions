chrome.runtime.sendMessage(
  { op: "fetchtext" },
  //function(response) { document.body.innerText=response.text }
  function(response) {
    alert(response.text);
    foo(response.text);
  }
);

function foo(t) {
  console.log(t);
}
