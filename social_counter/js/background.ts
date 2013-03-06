/// <reference path="jquery.d.ts" /> 

module Service {

	interface IProviderService {
		getApiUrl: () => string;
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

	function fetchApi(targetUrl: string, providerService: IProviderService) {
		$.ajax({
            type : 'GET',
            url : providerService.getApiUrl() + targetUrl,
            dataType : 'json',
            success : function(json, dataType){
            	console.log(json);
                var count = providerService.parseJson(json);
                console.log(count);
        		providerService.render(count);
            },
            error : function() {
            	//TODO
            }
        });
    };

	export function exec() {
		var hatena = new HatenaService();
		var facebook = new FacebookService();
		var twitter = new TwitterService();
	}
}

module ChromeApi {
	export function setBadgeText(detail) {
		chrome.browserAction.setBadgeText(detail);
	}
	export function setBadgeBgColor(detail) {
		chrome.browserAction.setBadgeBackgroundColor(detail);
	}
	export function getCurrentTabUrl(callback) {
		chrome.tabs.getCurrent(function(tab){
			console.log(tab);
			alert(tab);
			//TODO
			var id = tab.id;
			var title = tab.title;
			var favicon = tab.faviconUrl;
			var targetUrl = tab.url;

			callback(targetUrl);
		});		
	}
}

module Request {
	export function sendRequest() {

	}
}

module Processor {
	ChromeApi.setBadgeText({text:'9999'});
	ChromeApi.setBadgeBgColor({color:'#FF0000'});

	Service.exec();
}