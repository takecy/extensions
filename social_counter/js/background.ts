/// <reference path="jquery.d.ts" /> 

module Service {

	export interface IProviderService {
		apiUrl: string;
		getCount: (targetUrl: string) => number;
		parseJson: (json: string) => number;
		render: (count: number) => void;
	}

	export class HatenaService implements IProviderService {
		private apiUrl = 'http://b.hatena.ne.jp/entry/jsonlite/';
		
		getCount(targetUrl: string): number {
			var apiJson = null;
			fetchApi(this.apiUrl, targetUrl)
			.done(function(json){
				console.log('[hatena]' + json);
				apiJson = json;
			})
			.fail(function(){
				console.log('[hatena]' + 'fail');
			});

            if(apiJson) return apiJson['count'];
            return 0;
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

	export class TwitterService implements IProviderService {
		private apiUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=';

		getCount(targetUrl: string): number {
			var apiJson = null;
			fetchApi(this.apiUrl, targetUrl)
			.done(function(json){
				console.log('[twitter]' + json);
				apiJson = json;
			})
			.fail(function(){
				console.log('[twitter]' + 'fail');
			});

            if(apiJson) return apiJson['count'];
            return 0;
		}
		parseJson(json: string): number {
            return json['count'];
		}
		render(count: number): void {
			//TODO
			return;
		}
	}

	export class FacebookService implements IProviderService {
		private apiUrl = 'https://graph.facebook.com/';

		getCount(targetUrl: string): number {
			var apiJson = null;
			fetchApi(this.apiUrl, targetUrl)
			.done(function(json){
				console.log('[facebook]' + json);
				apiJson = json;
			})
			.fail(function(){
				console.log('[facebook]' + 'fail');
			});

            if(apiJson) return apiJson['shares'];
            return 0;
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

	function fetchApi(apiUrl: string, targetUrl: string) {	
    	console.log('[fetchApi]' + apiUrl);
    	console.log('[fetchApi]' + targetUrl);

		var deferred = $.Deferred();
		$.ajax({
            type : 'GET',
            url : apiUrl + targetUrl,
            dataType : 'json'
        })
        .done(function(json, dataType) {
        	console.log('[fetchApi]' + dataType);
        	console.log('[fetchApi]' + json);
        	deferred.resolve(json, dataType);
    	})
    	.fail(function() {
        	console.log('[fetchApi]' + 'fail');
    		deferred.reject();	
		});

    	return deferred.promise();
    };
}

module TabService {
	export class Badge {
		constructor(public text: string, public color: string) { }
	}
	export function setBadge(badge: Badge) {
		chrome.browserAction.setBadgeText({text: badge.text});
		chrome.browserAction.setBadgeBackgroundColor({color: badge.color});
	}

	//TODO when tab selected and updated, add listner event.
	export function getCurrentTabUrl() {
		var deferred = $.Deferred();

		chrome.tabs.getCurrent(function(tab){
			console.log('[tab]' + tab);
			//取得不許可のページの場合
			if(!tab) {
				deferred.reject();
			} else {
				deferred.resolve(tab.url);
			}
		});		
			
		return deferred.promise();
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
	var badge = new TabService.Badge('9999', '#FF0000');
	TabService.setBadge(badge);

	var targetUrl = 'http://google.co.jp';
	TabService.getCurrentTabUrl()
	.done(function(url){
		console.log('[tab]' + url);
		targetUrl = url;
	})
	.fail(function(){
		console.log('[tab]' + 'fail');
	});


	(function() {
		var hatena = new Service.HatenaService();
		var facebook = new Service.FacebookService();
		var twitter = new Service.TwitterService();

		var hatenaCount = hatena.getCount(targetUrl);
		console.log('[hatenaCount]' + hatenaCount);

//		var likeCount = facebook.getCount(targetUrl);
//		console.log('[likeCount]' + likeCount);

//		var tweetCount = twitter.getCount(targetUrl);
//		console.log('[tweetCount]' + tweetCount);
	})();

}
