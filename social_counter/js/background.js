var Service;
(function (Service) {
    var HatenaService = (function () {
        function HatenaService() { }
        HatenaService.prototype.getCount = function () {
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
        TwitterService.prototype.getCount = function () {
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
        FacebookService.prototype.getCount = function () {
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
    function fetchApi(apiUrl, targetUrl) {
        $.ajax({
            type: 'GET',
            url: apiUrl + targetUrl,
            dataType: 'json'
        }).done(function (json, dataType) {
            console.log(json);
        }).fail(function () {
        });
    }
    ;
    function exec(targetUrl) {
        var hatena = new HatenaService();
        var facebook = new FacebookService();
        var twitter = new TwitterService();
    }
    Service.exec = exec;
})(Service || (Service = {}));
var ChromeApi;
(function (ChromeApi) {
    var Badge = (function () {
        function Badge(text, color) {
            this.text = text;
            this.color = color;
        }
        return Badge;
    })();
    ChromeApi.Badge = Badge;    
    function setBadge(badge) {
        chrome.browserAction.setBadgeText({
            text: badge.text
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: badge.color
        });
    }
    ChromeApi.setBadge = setBadge;
    function getCurrentTabUrl(callback) {
        console.log('[callback]' + callback);
        if(!callback) {
            return;
        }
        chrome.tabs.getCurrent(function (tab) {
            console.log(tab);
            if(!tab) {
                return callback(null);
            }
            var id = tab.id;
            var title = tab.title;
            var favicon = tab.faviconUrl;
            var targetUrl = tab.url;
            callback(tab);
        });
    }
    ChromeApi.getCurrentTabUrl = getCurrentTabUrl;
    function openTab(url, callback) {
        chrome.tabs.create({
            url: url
        }, callback);
    }
    ChromeApi.openTab = openTab;
})(ChromeApi || (ChromeApi = {}));
var Message;
(function (Message) {
    function sendRequest(request, callback) {
        chrome.extension.sendRequest({
            id: request
        }, callback);
    }
    Message.sendRequest = sendRequest;
    function receiveRequest() {
        chrome.extension.onRequest.addListener(function (request, sender, callback) {
            var id = request.id;
            if(id === "getCount") {
            } else if(id === "refresh") {
            } else if(id === "delCache") {
            }
        });
    }
})(Message || (Message = {}));
var Processor;
(function (Processor) {
    var badge = new ChromeApi.Badge('9999', '#FF0000');
    ChromeApi.setBadge(badge);
    ChromeApi.getCurrentTabUrl(null);
    Service.exec(null);
})(Processor || (Processor = {}));
