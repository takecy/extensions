/// <reference path="service.ts" /> 

module Processor {

	export var getAllCount = function(tabId: number, targetUrl: string): any {
		console.log('[tabId]' + tabId);
		console.log('[targetUrl]' + targetUrl);
		targetUrl = targetUrl.trim();

		var hatena = new ProviderService.HatenaService();
		var facebook = new ProviderService.FacebookService();
		var twitter = new ProviderService.TwitterService();

		$.when(hatena.getCount(targetUrl), facebook.getCount(targetUrl), twitter.getCount(targetUrl))
		.done(function(hatena, facebook, twitter){
			console.log('[hatena]' + hatena);
			console.log('[like]' + facebook);
			console.log('[tweet]' + twitter);

			var totalCount = parseInt(hatena.count) + parseInt(facebook.count) + parseInt(twitter.count);
			console.log('[total]' + totalCount);

			var countInfo = {
				hatena: hatena,
				facebook: facebook,
				twitter: twitter,
				total: new ProviderService.SocialInfo(totalCount.toString(), '')
			}
			console.log(JSON.stringify(countInfo));

			localStorage.setItem(tabId.toString(), JSON.stringify(countInfo));


			var colorCode = TabService.getColorCode(totalCount).toString();

			Animation.rotateIcon();
			var badge = new TabService.Badge(totalCount.toString(), colorCode);
			TabService.setBadge(badge);
		})
		.fail(function(){
			console.log('fail');
		});
	};

	//badge init
	var badge = new TabService.Badge('-', TabService.getColorCode(0).toString());
	TabService.setBadge(badge);

	//create
	chrome.tabs.onCreated.addListener(function(tab) {
		var tabId = tab.id;
		var tabUrl = tab.url;
		console.log('[onCreated]' + tabId);
		console.log('[onCreated]' + tabUrl);
		getAllCount(tabId, tabUrl);
	});

	//update
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
		var tabUrl = tab.url;
		console.log('[onUpdated]' + tabId);
		console.log('[onUpdated]' + tabUrl);
		getAllCount(tabId, tabUrl);
	});

	//activate
	chrome.tabs.onActivated.addListener(function(activeInfo) {
		var tabId = activeInfo.tabId;
		console.log('[onActivated]' + tabId);

		TabService.getTabInfo(tabId)
		.done(function(tabUrl){
			getAllCount(tabId, tabUrl);
		})
		.fail(function(){
			console.log('[onActivated]' + 'fail');
		});
	});

	//close
	chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
		console.log('[onRemoved]' + tabId);
		localStorage.removeItem(tabId);
	});
}
