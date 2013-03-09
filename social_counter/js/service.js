var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.ltrim = function () {
    return this.replace(/^\s+/, "");
};
String.prototype.rtrim = function () {
    return this.replace(/\s+$/, "");
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
                var count = that.parseCount(json);
                console.log(count);
                var link = that.parseLink(json);
                console.log(link);
                if(!count) {
                    deferred.resolve(new SocialInfo(0, link));
                } else {
                    deferred.resolve(new SocialInfo(count, link));
                }
            }).fail(function () {
                deferred.reject();
            });
            return deferred.promise();
        };
        BaseProviderService.prototype.parseLink = function (json) {
            return '';
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
        HatenaService.prototype.parseCount = function (json) {
            if(json) {
                return json['count'];
            }
            return 0;
        };
        HatenaService.prototype.parseLink = function (json) {
            if(json) {
                return json['entry_url'];
            }
            return '';
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
        TwitterService.prototype.parseCount = function (json) {
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
        FacebookService.prototype.parseCount = function (json) {
            if(json) {
                return json['shares'];
            }
            return 0;
        };
        return FacebookService;
    })(BaseProviderService);
    ProviderService.FacebookService = FacebookService;    
    var SocialInfo = (function () {
        function SocialInfo(count, link) {
            this.count = count;
            this.link = link;
        }
        return SocialInfo;
    })();
    ProviderService.SocialInfo = SocialInfo;    
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
    function getCurrentTab() {
        var deferred = $.Deferred();
        chrome.tabs.getSelected(null, function (tab) {
            console.log('[current tab]');
            console.log(tab);
            if(!tab) {
                deferred.reject();
            } else {
                deferred.resolve(tab);
            }
        });
        return deferred.promise();
    }
    TabService.getCurrentTab = getCurrentTab;
    function openTab(url, callback) {
        chrome.tabs.create({
            url: url
        }, callback);
    }
    TabService.openTab = openTab;
})(TabService || (TabService = {}));
var Animation;
(function (Animation) {
    function rotateIcon() {
        var iconPath = 'img/stars.png';
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
