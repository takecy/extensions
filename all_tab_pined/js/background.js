chrome.commands.onCommand.addListener(function(command) {
  if (command == "toggle-pin-all") {
    // Get the currently selected tab
    chrome.windows.getCurrent({populate: true}, function(window_) {
      // Toggle the pinned status
      var tabs = window_.tabs;
      console.log(tabs);
      tabs.reverse();
      for(i=0; i<tabs.length; i++) {
      	var tab = tabs[i];
      	chrome.tabs.update(tab.id, {'pinned': !tab.pinned});
      }
    });
  }
  else if(command == "toggle-pin") {
    chrome.tabs.getSelected(function(tab){
        chrome.tabs.update(tab.id, {'pinned': !tab.pinned});
    });
  }
});

