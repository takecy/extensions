chrome.commands.onCommand.addListener(function(command) {
  if (command == "toggle-pin") {
    // Get the currently selected tab
    chrome.windows.getCurrent(null, function(window_) {
      // Toggle the pinned status
      var tabs = window_.tabs;
      for(int=i; i<tabs.length; i++) {
      	var tab = tabs[i];
      	chrome.tab.update(tab.id, {'pinned': !tab.pinned});
      }
    });
  }
});

