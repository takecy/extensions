var Processor;
(function (Processor) {
    function getSocialInfo(tabId, targetUrl, callback) {
        console.log('[tabId]' + tabId);
        console.log('[targetUrl]' + targetUrl);
        targetUrl = targetUrl.trim();
        var hatena = new ProviderService.HatenaService();
        var facebook = new ProviderService.FacebookService();
        var twitter = new ProviderService.TwitterService();
        $.when(hatena.getCount(targetUrl), facebook.getCount(targetUrl), twitter.getCount(targetUrl)).done(function (hatena, facebook, twitter) {
            console.log('[hatena]' + hatena);
            console.log('[like]' + facebook);
            console.log('[tweet]' + twitter);
            var totalCount = parseInt(hatena.count) + parseInt(facebook.count) + parseInt(twitter.count);
            console.log('[total]' + totalCount);
            if(totalCount > 9999) {
                totalCount = 9999;
            }
            var countInfo = {
                hatena: hatena,
                facebook: facebook,
                twitter: twitter,
                total: new ProviderService.SocialInfo(totalCount.toString(), '')
            };
            console.log(JSON.stringify(countInfo));
            localStorage.setItem(tabId.toString(), JSON.stringify(countInfo));
            if(callback) {
                callback(totalCount);
            }
        }).fail(function () {
            console.log('fail');
            var badge = new TabService.Badge('error', TabService.getColorCode(0).toString());
            TabService.setBadge(badge);
        });
    }
    ;
    (function () {
        var badge = new TabService.Badge('load...', TabService.getColorCode(0).toString());
        TabService.setBadge(badge);
    })();
    chrome.tabs.onCreated.addListener(function (tab) {
        var tabId = tab.id;
        var tabUrl = tab.url;
        console.log('[onCreated]' + tabId);
        console.log('[onCreated]' + tabUrl);
        var active = tab.active;
        if(!tabUrl || !active) {
            return;
        }
        getSocialInfo(tabId, tabUrl, null);
    });
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        var tabUrl = tab.url;
        console.log('[onUpdated]' + tabId);
        console.log('[onUpdated]' + tabUrl);
        var countInfo_before = localStorage.getItem(tabId);
        if(typeof countInfo_before === 'undefined') {
            var totalCount_before = 0;
        } else {
            var totalCount_before = countInfo_before.total.count;
        }
        getSocialInfo(tabId, tabUrl, function (totalCount) {
            if(totalCount_before === totalCount) {
                return;
            }
            var colorCode = TabService.getColorCode(totalCount).toString();
            Animation.rotateIcon();
            var badge = new TabService.Badge(totalCount.toString(), colorCode);
            TabService.setBadge(badge);
        });
    });
    chrome.tabs.onActivated.addListener(function (activeInfo) {
        var tabId = activeInfo.tabId;
        console.log('[onActivated]' + tabId);
        TabService.getTabInfo(tabId).done(function (tabUrl) {
            getSocialInfo(tabId, tabUrl, function (totalCount) {
                var colorCode = TabService.getColorCode(totalCount).toString();
                Animation.rotateIcon();
                var badge = new TabService.Badge(totalCount.toString(), colorCode);
                TabService.setBadge(badge);
            });
        }).fail(function () {
            console.log('[onActivated]' + 'fail');
        });
    });
    chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
        console.log('[onRemoved]' + tabId);
        localStorage.removeItem(tabId);
    });
})(Processor || (Processor = {}));
