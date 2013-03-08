var Processor;
(function (Processor) {
    Processor.getAllCount = function (tabId, targetUrl) {
        console.log('[tabId]' + tabId);
        console.log('[targetUrl]' + targetUrl);
        targetUrl = targetUrl.trim();
        var hatena = new ProviderService.HatenaService();
        var facebook = new ProviderService.FacebookService();
        var twitter = new ProviderService.TwitterService();
        $.when(hatena.getCount(targetUrl), facebook.getCount(targetUrl), twitter.getCount(targetUrl)).done(function (hatenaCount, likeCount, tweetCount) {
            console.log('[hatena]' + hatenaCount);
            console.log('[like]' + likeCount);
            console.log('[tweet]' + tweetCount);
            var totalCount = parseInt(hatenaCount) + parseInt(likeCount) + parseInt(tweetCount);
            console.log('[total]' + totalCount);
            var countInfo = {
                hatenaCount: hatenaCount,
                likeCount: likeCount,
                tweetCount: tweetCount,
                totalCount: totalCount
            };
            console.log(JSON.stringify(countInfo));
            localStorage.setItem(tabId.toString(), JSON.stringify(countInfo));
            var colorCode = TabService.getColorCode(totalCount).toString();
            Animation.rotateIcon();
            var badge = new TabService.Badge(totalCount.toString(), colorCode);
            TabService.setBadge(badge);
        }).fail(function () {
            console.log('fail');
        });
    };
    var badge = new TabService.Badge('-', TabService.getColorCode(0).toString());
    TabService.setBadge(badge);
    chrome.tabs.onCreated.addListener(function (tab) {
        var tabId = tab.id;
        var tabUrl = tab.url;
        console.log('[onCreated]' + tabId);
        console.log('[onCreated]' + tabUrl);
        Processor.getAllCount(tabId, tabUrl);
    });
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        var tabUrl = tab.url;
        console.log('[onUpdated]' + tabId);
        console.log('[onUpdated]' + tabUrl);
        Processor.getAllCount(tabId, tabUrl);
    });
    chrome.tabs.onActivated.addListener(function (activeInfo) {
        var tabId = activeInfo.tabId;
        console.log('[onActivated]' + tabId);
        TabService.getTabInfo(tabId).done(function (tabUrl) {
            Processor.getAllCount(tabId, tabUrl);
        }).fail(function () {
            console.log('[onActivated]' + 'fail');
        });
    });
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        console.log('[onRemoved]' + tabId);
        localStorage.removeItem(tabId);
    });
})(Processor || (Processor = {}));
