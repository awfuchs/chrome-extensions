// Saves options to chrome.storage
function save_options() {
  console.log("saving options...");
  var minPL = document.getElementById('minparalen').value;
  var maxPL = document.getElementById('maxparalen').value;
  var whatchannel = document.getElementById('outputchannel').value;
  
  chrome.storage.sync.set({
    minimumParagraphLength: minPL,
    maximumParagraphLength: maxPL,
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
    outputChannel: 'alert'
  }, function(items) {
    document.getElementById('minparalen').value = items.minimumParagraphLength;
    document.getElementById('maxparalen').value = items.maximumParagraphLength;
    document.getElementById('outputchannel').value = items.outputChannel;
    console.log("...options restored.");
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
