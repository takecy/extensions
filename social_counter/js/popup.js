var Service;
(function (Service) {
    function getBgPage() {
        return chrome.extension.getBackgroundPage();
    }
    Service.getBgPage = getBgPage;
})(Service || (Service = {}));
var Processor;
(function (Processor) {
    var bgPage = Service.getBgPage();
})(Processor || (Processor = {}));
