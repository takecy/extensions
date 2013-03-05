var social_counter_bg;
(function (social_counter_bg) {
    var Urls = (function () {
        function Urls() {
            this.hatena = 'http://b.hatena.ne.jp/entry/jsonlite/';
            this.facebook = 'https://graph.facebook.com/';
            this.twitter = 'http://urls.api.twitter.com/1/urls/count.json?url=';
        }
        Urls.prototype.getHatena = function () {
            return this.hatena;
        };
        Urls.prototype.getFb = function () {
            return this.facebook;
        };
        Urls.prototype.getTwitter = function () {
            return this.twitter;
        };
        return Urls;
    })();    
    var countService = (function () {
        function countService() { }
        countService.prototype.getCount = function (apiUrl, targetUrl) {
            $.ajax({
                type: 'GET',
                url: apiUrl + targetUrl,
                dataType: 'json',
                success: function (json, dataType) {
                    var count = parseInt(json);
                    return count;
                },
                error: function () {
                }
            });
            return null;
        };
        return countService;
    })();    
})(social_counter_bg || (social_counter_bg = {}));
