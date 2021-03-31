# The ham-n-rich extensions

Experimental extension for Chrome browser. Enriches web pages by enclosing amateur radio callsigns with links to their
  respective QRZ pages.

Install this extension from the [Chrome Web Store][cws-hnr]

## Features

![Image of browser icon](package/images/mnr-logo-16.png)&emsp;&#x2190;When you click the browser button,
ham-n-rich locates text within body.innerHTML that matches a regexp for US callsigns, and encloses
that in a link to the QRZ page for that callsign.

## Issues

* US callsigns only (that was the RE that I got working so far...)
* Breaks on various edge cases, including importantly any already-linked calls, which get mangled.
* Replaces innerHTML, so might break other stuff.

## To do

* Support non-US calls


[cws-hnr]: https://chrome.google.com/webstore/detail/ham-n-rich/holfkbigfojhhhkhhpafhmbhlcghigpn?hl=en&authuser=0
[cws-mw]: https://chrome.google.com/webstore/detail/markwack/jelggpbbkpajemodhammmmbecnecanlf?hl=en&authuser=0

