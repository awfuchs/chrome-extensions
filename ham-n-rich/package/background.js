function linkCallSigns() {

  // =====
  // Call sign regexp formulas de
  // https://gist.github.com/JoshuaCarroll/f6b2c64992dfe23feed49a117f5d1a43
  // =====
  // All amateur radio call signs:
  // [a-zA-Z0-9]{1,3}[0123456789][a-zA-Z0-9]{0,3}[a-zA-Z]
  //
  // Non-US call signs:
  // \b(?!K)(?!k)(?!N)(?!n)(?!W)(?!w)(?!A[A-L])(?!a[a-l])[a-zA-Z0-9][a-zA-Z0-9]?[a-zA-Z0-9]?[0123456789][a-zA-Z0-9][a-zA-Z0-9]?[a-zA-Z0-9]?[a-zA-Z0-9]?\b
  //
  // US call signs:
  // [AKNWaknw][a-zA-Z]{0,2}[0123456789][a-zA-Z]{1,3}

  t = document.querySelectorAll("div,p");
  // US--> var regex = new RegExp('(A[A-L]|K[A-Z]|N[A-Z]|W[A-Z]|K|N|W){1}\\d{1}[A-Z]{1,3}','g');
  var regex = new RegExp('[A-Z0-9]{1,3}[0123456789][A-Z0-9]{0,3}[A-Z]','g');
  for( e in t ) {
    t[e].innerHTML = t[e].innerHTML.replace(regex, '<a href="https://www.qrz.com/db/$&">$&</a>');
  }
}

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: linkCallSigns
  });
});


