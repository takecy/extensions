/// <reference path="jquery.d.ts" /> 

module Service {

	interface IProviderService {
		getCount: () => string;
		parseJson: (json: string) => number;
		render: (count: number) => void;
	}

	class HatenaService implements IProviderService {
		getApiUrl(): string {
			return 'http://b.hatena.ne.jp/entry/jsonlite/';
		}
		parseJson(json: string): number {
            if(json) return json['count'];
            return 0;
		}
		render(count: number): void {
			//TODO
			return;
		}
	}

	class TwitterService implements IProviderService {
		getApiUrl(): string {
			return 'http://urls.api.twitter.com/1/urls/count.json?url=';
		}
		parseJson(json: string): number {
            return json['count'];
		}
		render(count: number): void {
			//TODO
			return;
		}
	}

	class FacebookService implements IProviderService {
		getApiUrl(): string {
			return 'https://graph.facebook.com/';
		}
		parseJson(json: string): number {
	     	var count = json['shares'];
	        if(!count) return 0;
	        return count;
		}
		render(count: number): void {
			//TODO
			return;
		}
	}

	function fetchApi(targetUrl: string) {	
		$.ajax({
            type : 'GET',
            url : providerService.getApiUrl() + targetUrl,
            dataType : 'json'
        })
        .done(function(json, dataType){
            	console.log(json);
                var count = providerService.parseJson(json);
                console.log(count);
        		providerService.render(count);
        })
        .fail(function(){
        	//TODO	
    	});
    };

	export function exec(targetUrl: string) {
		var hatena = new HatenaService();
		var facebook = new FacebookService();
		var twitter = new TwitterService();
	}
}

module ChromeApi {
	export class Badge {
		constructor(public text: string, public color: stinrg) { }
	}
	export function setBadge(badge: Badge) {
		chrome.browserAction.setBadgeText({text: badge.text});
		chrome.browserAction.setBadgeBackgroundColor({color: badge.color});
	}
	export function getCurrentTabUrl(callback: (tab: Tab) => any) {
		console.log('[callback]' + callback);
		if(!callback) return;

		chrome.tabs.getCurrent(function(tab){
			console.log(tab);
			//取得不許可のページの場合
			if(!tab) return callback(null);

			//TODO
			var id = tab.id;
			var title = tab.title;
			var favicon = tab.faviconUrl;
			var targetUrl = tab.url;

			callback(tab);
		});		
	}
	export function openTab(url: string, callback: any) {
		chrome.tabs.create({url: url}, callback);
	}
}

module Message {
	export function sendRequest(request: string, callback: any) {
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
	var badge = new ChromeApi.Badge('9999', '#FF0000');
	ChromeApi.setBadge(badge);

	ChromeApi.getCurrentTabUrl();
	Service.exec(targetUrl);
}
