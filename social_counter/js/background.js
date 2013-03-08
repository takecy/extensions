var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ProviderService;
(function (ProviderService) {
    var BaseProviderService = (function () {
        function BaseProviderService() { }
        BaseProviderService.prototype.getCount = function (targetUrl) {
            var that = this;
            var deferred = $.Deferred();
            fetchApi(this.apiUrl, targetUrl).done(function (json) {
                console.log('[provider]');
                console.log(json);
                var count = that.parseJson(json);
                console.log(count);
                if(!count) {
                    deferred.resolve(0);
                } else {
                    deferred.resolve(count);
                }
            }).fail(function () {
                deferred.reject();
            });
            return deferred.promise();
        };
        return BaseProviderService;
    })();
    ProviderService.BaseProviderService = BaseProviderService;    
    var HatenaService = (function (_super) {
        __extends(HatenaService, _super);
        function HatenaService() {
            _super.apply(this, arguments);

            this.apiUrl = 'http://b.hatena.ne.jp/entry/jsonlite/?url=';
        }
        HatenaService.prototype.parseJson = function (json) {
            if(json) {
                return json['count'];
            }
            return 0;
        };
        return HatenaService;
    })(BaseProviderService);
    ProviderService.HatenaService = HatenaService;    
    var TwitterService = (function (_super) {
        __extends(TwitterService, _super);
        function TwitterService() {
            _super.apply(this, arguments);

            this.apiUrl = 'http://urls.api.twitter.com/1/urls/count.json?url=';
        }
        TwitterService.prototype.parseJson = function (json) {
            if(json) {
                return json['count'];
            }
            return 0;
        };
        return TwitterService;
    })(BaseProviderService);
    ProviderService.TwitterService = TwitterService;    
    var FacebookService = (function (_super) {
        __extends(FacebookService, _super);
        function FacebookService() {
            _super.apply(this, arguments);

            this.apiUrl = 'https://graph.facebook.com/';
        }
        FacebookService.prototype.parseJson = function (json) {
            if(json) {
                return json['shares'];
            }
            return 0;
        };
        return FacebookService;
    })(BaseProviderService);
    ProviderService.FacebookService = FacebookService;    
    function fetchApi(apiUrl, targetUrl) {
        console.log('[fetchApi]' + apiUrl + targetUrl);
        var deferred = $.Deferred();
        $.ajax({
            type: 'GET',
            url: apiUrl + targetUrl,
            dataType: 'json'
        }).done(function (json, dataType) {
            console.log('[fetchApi]');
            console.log(dataType);
            console.log(json);
            deferred.resolve(json, dataType);
        }).fail(function () {
            console.log('[fetchApi]' + 'fail');
            deferred.reject();
        });
        return deferred.promise();
    }
    ;
})(ProviderService || (ProviderService = {}));
var TabService;
(function (TabService) {
    var Badge = (function () {
        function Badge(text, color) {
            this.text = text;
            this.color = color;
        }
        return Badge;
    })();
    TabService.Badge = Badge;    
    function setBadge(badge) {
        chrome.browserAction.setBadgeText({
            text: badge.text
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color: badge.color
        });
    }
    TabService.setBadge = setBadge;
    function getColorCode(count) {
        if(count < 10) {
            return '#7aacf3';
        } else if(count >= 10) {
            return '#5c91dd';
        } else if(count >= 100) {
            return '#3e72bd';
        } else if(count >= 300) {
            return '#285f97';
        }
    }
    TabService.getColorCode = getColorCode;
    function getCurrentTab() {
        var deferred = $.Deferred();
        chrome.tabs.getCurrent(function (tab) {
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
    TabService.getCurrentTab = getCurrentTab;
    function getTabInfo(tabId) {
        var deferred = $.Deferred();
        chrome.tabs.get(tabId, function (tab) {
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
    TabService.getTabInfo = getTabInfo;
    function openTab(url, callback) {
        chrome.tabs.create({
            url: url
        }, callback);
    }
    TabService.openTab = openTab;
})(TabService || (TabService = {}));
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
var Animation;
(function (Animation) {
    function rotateIcon() {
        var iconPath = 'img/google_128.png';
        var canvas = $("<canvas>").attr("width", "19").attr("height", "19")[0];
        var icon = new Image();
        icon.src = iconPath;
        var ctx = canvas.getContext('2d');
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var cx = canvasWidth / 2;
        var cy = canvasHeight / 2;
        ctx.translate(cx, cy);
        var count = 0;
        var rotate = function () {
            var rotationAngle = 10;
            var rotationAllAngle = 360 * 2;
            ctx.clearRect(-cx, -cy, canvasWidth, canvasHeight);
            ctx.rotate(rotationAngle * Math.PI / 180);
            ctx.drawImage(icon, -cx, -cy, canvasWidth, canvasHeight);
            chrome.browserAction.setIcon({
                imageData: ctx.getImageData(0, 0, canvasWidth, canvasHeight)
            });
            if(++count >= (rotationAllAngle / rotationAngle)) {
                clearInterval(timer);
            }
        };
        var timer = setInterval(rotate, 1);
    }
    Animation.rotateIcon = rotateIcon;
    ;
})(Animation || (Animation = {}));
var Processor;
(function (Processor) {
    var badge = new TabService.Badge('-', TabService.getColorCode(0).toString());
    TabService.setBadge(badge);
    var getAllCount = function (targetUrl) {
        var hatena = new ProviderService.HatenaService();
        var facebook = new ProviderService.FacebookService();
        var twitter = new ProviderService.TwitterService();
        $.when(hatena.getCount(targetUrl), facebook.getCount(targetUrl), twitter.getCount(targetUrl)).done(function (hatenaCount, likeCount, tweetCount) {
            console.log('[hatena]' + hatenaCount);
            console.log('[like]' + likeCount);
            console.log('[tweet]' + tweetCount);
            var totalCount = parseInt(hatenaCount) + parseInt(likeCount) + parseInt(tweetCount);
            console.log('[total]' + totalCount);
            var colorCode = TabService.getColorCode(totalCount).toString();
            Animation.rotateIcon();
            var badge = new TabService.Badge(totalCount.toString(), colorCode);
            TabService.setBadge(badge);
        }).fail(function () {
            console.log('fail');
        });
    };
    chrome.tabs.onCreated.addListener(function (tab) {
        var tabId = tab.tabId;
        var tabUrl = tab.url;
        console.log('[onCreated]' + tabUrl);
        getAllCount(tabUrl);
    });
    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        var tabUrl = tab.url;
        console.log('[onUpdated]' + tabUrl);
        getAllCount(tabUrl);
    });
    chrome.tabs.onActivated.addListener(function (activeInfo) {
        var tabId = activeInfo.tabId;
        console.log('[onActivated]' + tabId);
        TabService.getTabInfo(tabId).done(function (tabUrl) {
            getAllCount(tabUrl);
        }).fail(function () {
            console.log('[onActivated]' + 'fail');
        });
    });
})(Processor || (Processor = {}));
