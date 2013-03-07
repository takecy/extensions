var Service;
(function (Service) {
    function getBgPage() {
        return chrome.extension.getBackgroundPage();
    }
    Service.getBgPage = getBgPage;
    function sendRequest(request, callback) {
        chrome.extension.sendRequest({
            id: request
        }, callback);
    }
    Service.sendRequest = sendRequest;
    function receiveRequest() {
        chrome.extension.onRequest.addListener(function (request, sender, callback) {
            var id = request.id;
            if(id === "getCount") {
            } else if(id === "refresh") {
            } else if(id === "delCache") {
            }
        });
    }
})(Service || (Service = {}));
var Processor;
(function (Processor) {
    var bgPage = Service.getBgPage();
    console.log(bgPage);
})(Processor || (Processor = {}));
