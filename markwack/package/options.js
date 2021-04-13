// Saves options to chrome.storage
function save_options() {
  console.log("saving options...");
  var minPL = document.getElementById('minparalen').value;
  var maxPL = document.getElementById('maxparalen').value;
  var minPnum = document.getElementById('minparanum').value;
  var maxPnum = document.getElementById('maxparanum').value;
  var minphrase = document.getElementById('minphraselen').value;
  var maxphrase = document.getElementById('maxphraselen').value;
  var pMin = document.getElementById('minparselen').value;
  var tSize = document.getElementById('tuplesize').value;
  var whatchannel = document.getElementById('outputchannel').value;
  var elemType = document.getElementById('elementtype').value;
  
  chrome.storage.sync.set({
    minimumParagraphLength: minPL,
    maximumParagraphLength: maxPL,
    minimumParagraphNumber: minPnum,
    maximumParagraphNumber: maxPnum,
    minimumSentenceLength: minphrase,
    maximumSentenceLength: maxphrase,
    htmlElementType: elemType,
    minimumParseLength: pMin,
    tupleSize: tSize,
    outputChannel: whatchannel
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores options state using the preferences stored in chrome.storage
function restore_options() {
  console.log("Restoring options...");
  chrome.storage.sync.get({
    minimumParagraphLength: '2',
    maximumParagraphLength: '6',
    minimumParagraphNumber: 1,
    maximumParagraphNumber: 6,
    minimumSentenceLength: 1,
    maximumSentenceLength: 6,
    htmlElementType: "p",
    minimumParseLength: 1,
    tupleSize: 'pairs',
    outputChannel: 'alert'
  }, function(items) {
    document.getElementById('minparalen').value = items.minimumParagraphLength;
    document.getElementById('maxparalen').value = items.maximumParagraphLength;
    document.getElementById('minparanum').value = items.minimumParagraphNumber;
    document.getElementById('maxparanum').value = items.maximumParagraphNumber;
    document.getElementById('minphraselen').value = items.minimumSentenceLength;
    document.getElementById('maxphraselen').value = items.maximumSentenceLength;
    document.getElementById('elementtype').value = items.htmlElementType;
    document.getElementById('minparselen').value = items.minimumParseLength;
    document.getElementById('tuplesize').value = items.tupleSize;
    document.getElementById('outputchannel').value = items.outputChannel;
    console.log("...options restored.");
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);

