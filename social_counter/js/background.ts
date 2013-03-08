/// <reference path="jquery.d.ts" /> 

module ProviderService {

	export interface IProviderService {
		apiUrl: string;
		getCount: (targetUrl: string) => any;
		parseJson: (json: string) => number;
	}

	export class BaseProviderService implements IProviderService {
		getCount(targetUrl: string): any {
			var that = this;
			var deferred = $.Deferred();

			fetchApi(this.apiUrl, targetUrl)
			.done(function(json){
				console.log('[provider]');
				console.log(json);

				var count = that.parseJson(json);
				console.log(count);

				if(!count) deferred.resolve(0);
				else deferred.resolve(count);
			})
			.fail(function(){
				deferred.reject();
			});

			return deferred.promise();
		}
	}

	export class HatenaService extends BaseProviderService {
		private apiUrl = 'http://b.hatena.ne.jp/entry/jsonlite/?url=';
		
		parseJson(json: string): number {
            if(json) return json['count'];
            return 0;
		}
	}

	export class TwitterService extends BaseProviderService {
		private apiUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=';

		parseJson(json: string): number {
            if(json) return json['count'];
            return 0;
		}
	}

	export class FacebookService extends BaseProviderService {
		private apiUrl = 'https://graph.facebook.com/';

		parseJson(json: string): number {
            if(json) return json['shares'];
            return 0;
		}
	}

	function fetchApi(apiUrl: string, targetUrl: string) {	
    	console.log('[fetchApi]' + apiUrl + targetUrl);

		var deferred = $.Deferred();
		$.ajax({
            type : 'GET',
            url : apiUrl + targetUrl,
            dataType : 'json'
        })
        .done(function(json, dataType) {
        	console.log('[fetchApi]');
        	console.log(dataType);
        	console.log(json);
        	deferred.resolve(json, dataType);
    	})
    	.fail(function(){
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

	export function getColorCode(count: number): string{
	    if(count < 10) return '#7aacf3';
	    else if(count >= 10) return '#5c91dd';
	    else if(count >= 100) return '#3e72bd';
	    else if(count >= 300) return '#285f97';
	}

	export function getCurrentTab(): any {
		var deferred = $.Deferred();

		chrome.tabs.getCurrent(function(tab){
			console.log('[current tab]');
			console.log(tab);
			if(!tab) {
				deferred.reject();
			} else {
				deferred.resolve(tab.url);
			}
		});		
			
		return deferred.promise();
	}

	export function getTabInfo(tabId: number): any {
		var deferred = $.Deferred();

		chrome.tabs.get(tabId, function(tab){
			console.log('[tab]');
			console.log(tab);
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

module Animation {
	export function rotateIcon() {
		var iconPath = 'img/google_128.png';
		var canvas = $("<canvas>").attr("width","19").attr("height","19")[0];
		var icon = new Image();
		icon.src = iconPath;
		
		//コンテキストの取得
		var ctx = canvas.getContext('2d');
		//canvasの高さと幅
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;
		//中心座標
		var cx = canvasWidth / 2;
		var cy = canvasHeight / 2;
		
		//中心座標を移動
		ctx.translate(cx, cy);
		var count = 0;
		//1回の回転処理
		var rotate = function() {
			//1回の回転角度
			var rotationAngle = 10;
			//総回転角度
			var rotationAllAngle = 360*2;
			//canvas消去
			ctx.clearRect(-cx, -cy, canvasWidth, canvasHeight);
			//回転実行
			ctx.rotate(rotationAngle * Math.PI / 180);
			//描画
			ctx.drawImage(icon, -cx, -cy, canvasWidth, canvasHeight);
			//アイコン設定
			chrome.browserAction.setIcon({imageData : ctx.getImageData(0, 0, canvasWidth, canvasHeight)});
			//回転終わったら実行解除
			if(++count >= (rotationAllAngle / rotationAngle)) clearInterval(timer);
		};
		//定期実行
		var timer = setInterval(rotate, 1);
	};

}

module Processor {

	var badge = new TabService.Badge('-', TabService.getColorCode(0).toString());
	TabService.setBadge(badge);

	var getAllCount = function(targetUrl: string) {
		var hatena = new ProviderService.HatenaService();
		var facebook = new ProviderService.FacebookService();
		var twitter = new ProviderService.TwitterService();

		$.when(hatena.getCount(targetUrl), facebook.getCount(targetUrl), twitter.getCount(targetUrl))
		.done(function(hatenaCount, likeCount, tweetCount){
			console.log('[hatena]' + hatenaCount);
			console.log('[like]' + likeCount);
			console.log('[tweet]' + tweetCount);

			var totalCount = parseInt(hatenaCount) + parseInt(likeCount) + parseInt(tweetCount);
			console.log('[total]' + totalCount);
			var colorCode = TabService.getColorCode(totalCount).toString();

			Animation.rotateIcon();
			var badge = new TabService.Badge(totalCount.toString(), colorCode);
			TabService.setBadge(badge);
		})
		.fail(function(){
			console.log('fail');
		});
	};

	//create
	chrome.tabs.onCreated.addListener(function(tab) {
		var tabId = tab.tabId;
		var tabUrl = tab.url;
		console.log('[onCreated]' + tabUrl);
		getAllCount(tabUrl);
	});

	//update
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		var tabUrl = tab.url;
		console.log('[onUpdated]' + tabUrl);
		getAllCount(tabUrl);
	});

	//activate
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		var tabId = activeInfo.tabId;
		console.log('[onActivated]' + tabId);

		TabService.getTabInfo(tabId)
		.done(function(tabUrl){
			getAllCount(tabUrl);
		})
		.fail(function(){
			console.log('[onActivated]' + 'fail');
		});
	});

}
