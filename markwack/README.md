# The markwack extension

<img src="package/images/mw-logo-128.png">

Experimental extension for Chrome browser. Generates random text that resembles the content of the
current web page. The name is a portmanteau of MARKov chain WACKy text.

Install version 0.3 of this extension from the [Chrome Web Store][cws-mw]. The source code is in the [.../markwack/package][mw-package] directory, with the tag `mw0.3` reflecting the current version.

## Features

![Image of browser icon](package/images/mw-logo-16.png)&emsp;&#x2190;When you click the browser button,
markwack does the following:

1. Grab the text content of the page body
1. Do some preliminary cleanup to remove all but text characters, digits, and selected punctuation
1. Build arrays of starting words, ending words, and legal word transitions.
1. Generate random output strings based on the rules in the arrays.
1. Render the output.

See also [Theory of operation][mw-theory]

## Issues

* Doesn't support all languages. (Doesn't recognize as text Unicode characters over 04FF.)
* FIXED: Outputs only to an alert, so not easy to copy the output for Lorem Ipsum purposes.
* Configuration options are limited.

## To do

* **DONE Upgrade from two-word chaining rules to three-word rules.** I didn't do this initially because
  JavaScript doesn't easily do tuples as keys. This was easy as a Python dictionary. Probably will
  fake this in JS by concatenating keys into compound strings like "is|always".
* **Add more Unicode characters.** The constraint here is that we don't want most punctuation included
  in the strings, and it's hard for me to determine this for languages I don't know. 
* **WIP Allow more output channel options.** Only having this in an alert is not great to look at, and
  doesn't facilitate copying the text.
* **Generate random HTML elements.** It would be fun to include random headings, lists, tables, and
  so on. This is a much longer-term goal.

[cws-hnr]: https://chrome.google.com/webstore/detail/ham-n-rich/holfkbigfojhhhkhhpafhmbhlcghigpn?hl=en&authuser=0
[cws-mw]: https://chrome.google.com/webstore/detail/markwack/jelggpbbkpajemodhammmmbecnecanlf?hl=en&authuser=0
[mw-package]: package
[mw-theory]: theory.md

