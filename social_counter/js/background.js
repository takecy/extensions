var Service;
(function (Service) {
    var HatenaService = (function () {
        function HatenaService() {
            this.apiUrl = 'http://b.hatena.ne.jp/entry/jsonlite/';
        }
        HatenaService.prototype.getCount = function (targetUrl) {
            var apiJson = null;
            fetchApi(this.apiUrl, targetUrl).done(function (json, dataType) {
                console.log('success');
                console.log(json);
                console.log(dataType);
                apiJson = json;
            }).fail(function () {
                console.log('fail');
            });
            if(apiJson) {
                return apiJson['count'];
            }
            return 0;
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
    Service.HatenaService = HatenaService;    
    var TwitterService = (function () {
        function TwitterService() {
            this.apiUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=';
        }
        TwitterService.prototype.getCount = function (targetUrl) {
            var apiJson = null;
            fetchApi(this.apiUrl, targetUrl).done(function (json, dataType) {
                console.log('success');
                console.log(json);
                console.log(dataType);
                apiJson = json;
            }).fail(function () {
                console.log('fail');
            });
            if(apiJson) {
                return apiJson['count'];
            }
            return 0;
        };
        TwitterService.prototype.parseJson = function (json) {
            return json['count'];
        };
        TwitterService.prototype.render = function (count) {
            return;
        };
        return TwitterService;
    })();
    Service.TwitterService = TwitterService;    
    var FacebookService = (function () {
        function FacebookService() {
            this.apiUrl = 'https://graph.facebook.com/';
        }
        FacebookService.prototype.getCount = function (targetUrl) {
            var apiJson = null;
            fetchApi(this.apiUrl, targetUrl).done(function (json, dataType) {
                console.log('success');
                console.log(json);
                console.log(dataType);
                apiJson = json;
            }).fail(function () {
                console.log('fail');
            });
            if(apiJson) {
                return apiJson['shares'];
            }
            return 0;
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
    Service.FacebookService = FacebookService;    
    function fetchApi(apiUrl, targetUrl) {
        var deferred = $.Deferred();
        $.ajax({
            type: 'GET',
            url: apiUrl + targetUrl,
            dataType: 'json'
        }).done(function (json, dataType) {
            console.log('success');
            console.log(json);
            deferred.resolve(json, dataType);
        }).fail(function () {
            console.log('fail');
            deferred.reject();
        });
        return deferred.promise();
    }
    ;
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
    function getCurrentTabUrl() {
        var deferred = $.Deferred();
        chrome.tabs.getCurrent(function (tab) {
            console.log(tab);
            if(!tab) {
                deferred.reject();
            } else {
                deferred.resolve(tab.url);
            }
        });
        return deferred.promise();
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
    var targetUrl = 'http://google.co.jp';
    ChromeApi.getCurrentTabUrl().done(function (url) {
        console.log('success');
        console.log(url);
        targetUrl = url;
    }).fail(function () {
        console.log('fail');
    });
    function getCountAll(targetUrl) {
        var hatena = new Service.HatenaService();
        var facebook = new Service.FacebookService();
        var twitter = new Service.TwitterService();
        var hatenaCount = hatena.getCount(targetUrl);
        console.log('[hatenaCount]' + hatenaCount);
        var likeCount = facebook.getCount(targetUrl);
        console.log('[likeCount]' + likeCount);
        var tweetCount = twitter.getCount(targetUrl);
        console.log('[tweetCount]' + tweetCount);
    }
})(Processor || (Processor = {}));
