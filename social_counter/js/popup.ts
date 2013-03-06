module Service {
	
	export function getBgPage() {
		return chrome.extension.getBackgroundPage();
	}
}

module Processor {
	var bgPage = Service.getBgPage();
}