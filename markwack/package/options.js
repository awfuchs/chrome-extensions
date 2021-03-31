// Saves options to chrome.storage
function save_options() {
  var minPL = document.getElementById('minparas').value;
  var maxPL = document.getElementById('maxparas').value;
  chrome.storage.sync.set({
    minimumParagraphs: minPL,
    maximumParagraphs: maxPL,
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
  chrome.storage.sync.get({
    minimumParagraphs: '2',
    maximumParagraphs: '4'
  }, function(items) {
    document.getElementById('minparas').value = items.minimumParagraphs;
    document.getElementById('maxparas').value = items.maximumParagraphs;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
