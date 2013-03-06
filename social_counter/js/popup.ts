/// <reference path="jquery.d.ts" /> 

module Service {
	
	export function getBgPage() {
		return chrome.extension.getBackgroundPage();
	}
}

module Processor {
	var bgPage = Service.getBgPage();
	console.log(bgPage);
}