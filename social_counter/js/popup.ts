/// <reference path="jquery.d.ts" /> 

module Service {
	
	export function getBgPage() {
		return chrome.extension.getBackgroundPage();
	}
	export function sendRequest(request: string, callback) {
		chrome.extension.sendRequest({id: request}, callback);
	}
	function receiveRequest() {
		chrome.extension.onRequest.addListener(function(request, sender, callback) {
			var id = request.id;
			if(id === "getCount") {

			} else if (id === "refresh") {

			} else if (id === "delCache") {

			}
		});
	}
}

module Processor {
	var bgPage = Service.getBgPage();
	console.log(bgPage);
}