var Processor;
(function (Processor) {
    (function () {
        TabService.getCurrentTab().done(function (tab) {
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
            console.log('[like]' + likeCount);
            console.log('[tweet]' + tweetCount);
        }).fail(function () {
            console.log('[current tab]' + 'fail');
        });
    })();
})(Processor || (Processor = {}));
