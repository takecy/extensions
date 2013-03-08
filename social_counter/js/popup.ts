/// <reference path="jquery.d.ts" /> 

module Render {

}

module Processor {

	(function(){
		TabService.getCurrentTab()
		.done(function(tab){
			var tabId = tab.id.toString();
			var tabUrl = tab.url.trim();
			console.log('[current tab]' + tabId);
			console.log('[current tab]' + tabUrl);

			var countInfo = JSON.parse(localStorage.getItem(tabId));
			console.log(countInfo);

			var hatenaCount = countInfo.hatenaCount;
			var likeCount = countInfo.likeCount;
			var tweetCount = countInfo.tweetCount;
			var totalCount = countInfo.totalCount;

			console.log('[hatena]' + hatenaCount);
			console.log('[tweet]' + tweetCount);
			console.log('[like]' + likeCount);

			var hatenaCountSpan = $('<span>').addClass('counter').text(hatenaCount);
			$('#hatena').append(hatenaCountSpan);
			var twitterCountSpan = $('<span>').addClass('counter').text(tweetCount);
			$('#twitter').append(twitterCountSpan);
			var facebookCountSpan = $('<span>').addClass('counter').text(likeCount);
			$('#fb').append(facebookCountSpan);


		})
		.fail(function(){
			console.log('[current tab]' + 'fail');
		})
	})();
}