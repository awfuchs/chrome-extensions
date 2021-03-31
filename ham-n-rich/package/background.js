function linkCallSigns() {
  //alert("Howdy");
  t = document.querySelectorAll("div,p");
  var regex = new RegExp('(A[A-L]|K[A-Z]|N[A-Z]|W[A-Z]|K|N|W){1}\\d{1}[A-Z]{1,3}','g');
  for( e in t ) {
    //alert(t[e].innerHTML);
    //if( t[e].innerHTML.search(regex) {
      //alert(t[e].innerHTML);
    //}
    t[e].innerHTML = t[e].innerHTML.replace(regex, '<a href="https://www.qrz.com/db/$&">$&</a>');
    //alert(t[e].innerHTML.replace(regex, '<a href="https://www.qrz.com/db/$&">$&</a>'));
  }
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: linkCallSigns
  });
});


