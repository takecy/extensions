/// <reference path="jquery.d.ts" /> 

module Render {

	export function renderCount(link: string, count: string, providerName: string) {
		var $countSpan = $('<span>').addClass('counter').css('backgroundColor', TabService.getColorCode(count)).text(count);
		if(link)
			var $linkSpan = $('<a>').addClass('link').attr('href', link).attr('title', 'detail').append($countSpan);
		else 
			var $linkSpan = $countSpan;

		$('#' + providerName).append($linkSpan);
	}

	export function renderIcon(iconPath: string, providerName: string) {
		var $countSpan = $('<img>').addClass('icon').attr('title', providerName).attr('src', iconPath);
		$('#' + providerName).append($countSpan);
	}

	export function renderProvider(providerName: string): any {
		var $provider = $('<div>').attr('id', providerName);
		return $('#container').append($provider);
	}
}

module Processor {

	$(document).on('click', 'a.link', function(){
		var url = $(this).attr('href');
		console.log('[link click]' + url);
		chrome.tabs.create({url:url}, function(tab){
			console.log('[tab created]');
		});
	});

	(function(){
		TabService.getCurrentTab()
		.done(function(tab){
			var tabId = tab.id.toString();
			var tabUrl = tab.url.trim();
			console.log('[current tab]' + tabId);
			console.log('[current tab]' + tabUrl);

			var countInfo = JSON.parse(localStorage.getItem(tabId));
			console.log(countInfo);

			var hatenaCount = countInfo.hatena.count;
			var tweetCount = countInfo.twitter.count;
			var likeCount = countInfo.facebook.count;
			var totalCount = countInfo.total.count;

			console.log('[hatena]' + hatenaCount);
			console.log('[tweet]' + tweetCount);
			console.log('[like]' + likeCount);

			Render.renderProvider('hatena');
			Render.renderProvider('twitter');
			Render.renderProvider('facebook');

			Render.renderIcon('img/hatebu.png', 'hatena');
			Render.renderIcon('img/twitter.png', 'twitter');
			Render.renderIcon('img/like.jpg', 'facebook');

			Render.renderCount(countInfo.hatena.link, hatenaCount, 'hatena');
			Render.renderCount(countInfo.twitter.link, tweetCount, 'twitter');
			Render.renderCount(countInfo.facebook.link, likeCount, 'facebook');

		})
		.fail(function(){
			console.log('[current tab]' + 'fail');
		})
	})();
}