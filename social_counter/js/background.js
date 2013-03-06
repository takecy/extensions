var Service;
(function (Service) {
    var HatenaService = (function () {
        function HatenaService() { }
        HatenaService.prototype.getApiUrl = function () {
            return 'http://b.hatena.ne.jp/entry/jsonlite/';
        };
        HatenaService.prototype.parseJson = function (json) {
            if(json) {
                return json['count'];
            }
            return 0;
        };
        HatenaService.prototype.render = function (count) {
            return;
        };
        return HatenaService;
    })();    
    var TwitterService = (function () {
        function TwitterService() { }
        TwitterService.prototype.getApiUrl = function () {
            return 'http://urls.api.twitter.com/1/urls/count.json?url=';
        };
        TwitterService.prototype.parseJson = function (json) {
            return json['count'];
        };
        TwitterService.prototype.render = function (count) {
            return;
        };
        return TwitterService;
    })();    
    var FacebookService = (function () {
        function FacebookService() { }
        FacebookService.prototype.getApiUrl = function () {
            return 'https://graph.facebook.com/';
        };
        FacebookService.prototype.parseJson = function (json) {
            var count = json['shares'];
            if(!count) {
                return 0;
            }
            return count;
        };
        FacebookService.prototype.render = function (count) {
            return;
        };
        return FacebookService;
    })();    
    function fetchApi(targetUrl, providerService) {
        $.ajax({
            type: 'GET',
            url: providerService.getApiUrl() + targetUrl,
            dataType: 'json',
            success: function (json, dataType) {
                console.log(json);
                var count = providerService.parseJson(json);
                console.log(count);
                providerService.render(count);
            },
            error: function () {
            }
        });
    }
    ;
    function exec() {
        var hatena = new HatenaService();
        var facebook = new FacebookService();
        var twitter = new TwitterService();
    }
    Service.exec = exec;
})(Service || (Service = {}));
var ChromeApi;
(function (ChromeApi) {
    function setBadgeText(detail) {
        chrome.browserAction.setBadgeText(detail);
    }
    ChromeApi.setBadgeText = setBadgeText;
    function setBadgeBgColor(detail) {
        chrome.browserAction.setBadgeBackgroundColor(detail);
    }
    ChromeApi.setBadgeBgColor = setBadgeBgColor;
    function getCurrentTabUrl(callback) {
        chrome.tabs.getCurrent(function (tab) {
            console.log(tab);
            alert(tab);
            var id = tab.id;
            var title = tab.title;
            var favicon = tab.faviconUrl;
            var targetUrl = tab.url;
            callback(targetUrl);
        });
    }
    ChromeApi.getCurrentTabUrl = getCurrentTabUrl;
})(ChromeApi || (ChromeApi = {}));
var Request;
(function (Request) {
    function sendRequest() {
    }
    Request.sendRequest = sendRequest;
})(Request || (Request = {}));
var Processor;
(function (Processor) {
    ChromeApi.setBadgeText({
        text: '9999'
    });
    ChromeApi.setBadgeBgColor({
        color: '#FF0000'
    });
    Service.exec();
})(Processor || (Processor = {}));
