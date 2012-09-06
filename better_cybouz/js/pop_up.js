$(function() {

	var baseUrl = "https://caga.cyberagent.co.jp";
    var $loadImageDiv = $("<div>").addClass("loadingImg").append($("<img>").attr("src","img/loading_19.gif").css("width", "19px"));

    //-----------------------------------------------------------------------
    //お知らせ設定
    //-----------------------------------------------------------------------
	var setNotifies = function(notifies) {
	    var $notifies = $("#notifies");
		$notifies.empty().append($loadImageDiv);
		$notifies.addClass("span5").css("margin", "0");
		
        if(notifies.length == 0) {
            var $empty = $("<div>").addClass("span2 offset1").text("通知なし");
            $notifies.append($empty);
            $notifies.find(".loadingImg").remove();
            return;
        }

		$.each(notifies, function(index, data) {
		    var $row = $("<div>").addClass("row")
		                         .addClass("notify span5")
		                         .css("margin", "0 0 8px 5px")
		                         .css("border-left", "3px solid #ccc")
                                 .css("min-height", "35px");;
			var eventLink = $("<div>").addClass("event").addClass("span3").css("margin-left", "5px")
			                          .append($("<a>").attr("href", this.eventLink).text(this.event).addClass("eventLink"));

			var $rowRight = $("<div>").addClass("row").addClass("span2").css("margin-left", "10px");
			var $text = $("<div>").addClass("span1").css("margin-left", "5px");
			var date = $("<div>").addClass("date").text(this.date);
			var $nameSpan = $("<div>").addClass("name");
			var nameLink = $nameSpan.append($("<a>").attr("href", this.nameLink).text(this.name).addClass("nameLink"));
            nameLink.tooltip({title : this.name});

            var $imageArea = $("<div>").addClass("span1").css("margin-left", "5px");
            $imageArea.append($("<img>").attr("src", "img/loading_spinner_19.gif"));
            

			$text.append(date);
			$text.append(nameLink);
			$rowRight.append($text);
            $rowRight.append($imageArea);
			$row.append(eventLink);
			$row.append($rowRight);
			
			//hover時背景つける
            $row.hover(function(){
                $(this).stop(true, false).animate({backgroundColor:"#f5f5f5"}, 200);
            },
            function(){
                $(this).stop(true, false).animate({backgroundColor:"#ffffff"}, 500);
            });
            $row.tooltip({title : this.event});

			$notifies.append($row);
			getEmpInfo(this.nameLink, $imageArea);
		});
		
		$notifies.find(".loadingImg").remove();
	};
	

    //-----------------------------------------------------------------------
    //スケジュール設定
    //-----------------------------------------------------------------------
    var setSchedules = function(schedules) {
        var $schedules = $("#schedules");
        $schedules.empty().append($loadImageDiv);
        $schedules.addClass("span5").css("margin", "0");
        
        if(schedules.length == 0){
            var $empty = $("<div>").addClass("span2 offset1").text("予定なし");
            $schedules.append($empty);
            $schedules.find(".loadingImg").remove();
            return;
        }

        $.each(schedules, function(index, data) {
            var $row = $("<div>").addClass("row")
                                 .addClass("schedule span5")
                                 .css("margin", "0 0 8px 5px")
                                 .css("border-left", "3px solid #ccc")
                                 .css("min-height", "35px");
            var $eventLink = $("<div>").addClass("event").addClass("span2").css("margin-left", "5px")
                                       .append($("<a>").attr("href", this.link).text(this.content).addClass("eventLink"));
            
            var $date = $("<div>").addClass("span1").css("margin-left", "5px").text(this.startTime);
            if(this.overlap){
                var $overlap = $('<i>').addClass('icon-warning-sign').css('margin-left', '5px');
                $date.append($overlap);
            }
            var $place = $("<div>").addClass("span2").css("margin-left", "5px").text(this.place);
            
            //hover時背景つける
            $row.hover(function(){
                $(this).stop(true, false).animate({backgroundColor:"#f5f5f5"}, 200);
            },
            function(){
                $(this).stop(true, false).animate({backgroundColor:"#ffffff"}, 500);
            });
            $row.tooltip({title : this.content});

            $row.append($date).append($place).append($eventLink);
            $schedules.append($row);
        });
        
        $schedules.find(".loadingImg").remove();
    };

    //-----------------------------------------------------------------------
	//個別ページからmailと画像を取得
    //-----------------------------------------------------------------------
	var getEmpInfo = function(empUrl, object){
	    var uid = extractUid(empUrl);
	    
        //cache取得
        var empCaches = localStorage.getItem("empCaches");
        if(!empCaches) 
            empCaches = [];
        else 
            empCaches = JSON.parse(empCaches);
            
        var emp = searchCache(empCaches, uid);
        
        if(emp != null) return setEmpInfo(emp, object);

		$.get(empUrl, function(_data){
			var $bodyHtml = $(_data);
			var email = $bodyHtml.find("table.view_table")
								.find("tr")
								.filter(function(){
									var thText = $(this).find("th").text();
									return $.trim(thText) === "E-mail"
								}).find("td")
								.find("a")
								.text();
			
			var imageUrl = $bodyHtml.find("table.view_table")
								.find("tr")
								.filter(function(){
									var thText = $(this).find("th").text();
									return $.trim(thText) === "画像"
								}).find("td")
								.find("img")
								.attr("src");
            
            emp = new Emp(uid, email, imageUrl);
            setEmpInfo(emp, object);
            
            empCaches.push(emp);
            localStorage.setItem("empCaches", JSON.stringify(empCaches));
		});
	};
	
    //html組み立て
    var setEmpInfo = function(emp, object) {
        var imageSize = 40;
        var $mailTo = $("<a>").attr("href", "mailto:" + emp.email).attr("title", "メールする");
        
        var imageUrl = emp.imageUrl;
        if(!imageUrl)
            imageUrl = "img/no_image.png";
        else
            imageUrl = baseUrl + imageUrl;

        var $imageTag = $("<img>").attr("src", imageUrl).attr("width", imageSize).css("padding", "0 0 0 5px");
        var $imageLink = $mailTo.append($imageTag).fadeIn("2000");
        object.empty();
        object.append($imageLink);
    }

    //URLからuid抽出
    var extractUid = function(url) {
        var fromIndex = url.indexOf("uid=");
        if(fromIndex == -1) return "";
        
        var toIndex = url.indexOf("&", fromIndex + 1);
        if(toIndex == -1) return url.substring(fromIndex + 4);
        
        return url.substring(fromIndex + 4, toIndex);
    }
    //cache検索
    var searchCache = function(empCaches, uid){
        for(var i in empCaches){
            if(uid == empCaches[i].uid) return empCaches[i];
        };
        return null;
    };
	
    function Emp(uid, email, imageUrl) {
        this.uid = uid;
        this.email = email;
        this.imageUrl = imageUrl;
    }

    
    //-----------------------------------------------------------------------
    // イベント
    //-----------------------------------------------------------------------
    //更新ボタンイベント
    $("#refresh").on("click", function(){
        chrome.extension.sendRequest({event: "refresh"});
    });
    
    //tab切替イベント
    $(document).on("shown", 'a[data-toggle="tab"]', function (e) {
        var activeteTab = e.target;
        console.log(activeteTab);
        animateFooter();
    });
    
    //tab項目のhoverイベント
    // $(document).on("hover", 'a[data-toggle="tab"]', function (e) {
        // var $activeteTab = $(e.target);
    // });
    
    //タブ項目以外のリンククリックイベント
    $(document).on("click", "a:not([data-toggle='tab'])", function(){
        chrome.tabs.create({url:$(this).attr("href"), active:true});
        chrome.extension.sendRequest({event: "link_click"});
    });
    

    //-----------------------------------------------------------------------
    // footer
    //-----------------------------------------------------------------------
    //どうでもいいfooterアニメーション
    var animateFooter = function() {
        var $footer = $("#footer");
        $footer.hide().fadeIn("3000");
    };
    //footerのtooltip
    $("#information").tooltip({title : "info"});
    $("#settings").tooltip({title : "settings"});

	
    //-----------------------------------------------------------------------
	//sendRequest受信用
    //-----------------------------------------------------------------------
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		//ログインしてない場合
		if(request.event === "404" || request.event === "401") {
			console.log(request.event);
			$("#notifies").empty();
			var loginLink = $("<a>").attr("href", baseUrl + "/cgi-bin/cbgrn/grn.cgi/index?").text("ログイン").addClass("loginLink");
			$("#notifies").append($("<div>").addClass("login").append(loginLink));
			sendResponse({event : "displayed"});
		} 
		//notifies取得完了通知
		else if(request.event === "gotNotifies"){
			var background = chrome.extension.getBackgroundPage();
			var notifies = background.notifies;
			if(notifies) setNotifies(notifies);
		}
		else if(request.event === "gotUid") {
            // chrome.extension.sendRequest({event : "get_notifies"});
            // chrome.extension.sendRequest({event : "get_schedules"});
		}
        else if(request.event === "uid_empty") {
            chrome.extension.sendRequest({event : "get_uid"});
        }
		//schedules取得完了通知
		else if(request.event === "gotSchedules") {
			var background = chrome.extension.getBackgroundPage();
			var schedules = background.schedules;
			if(schedules) setSchedules(schedules);
		}
		else 
		  sendResponse({});
	});
	

	//-----------------------------------------------------------------------
	//popup表示時処理
	//-----------------------------------------------------------------------
	//ぐるぐる表示
	$("#notifies").empty().append($("<div>").addClass("loadingImg").append($("<img>").attr("src","img/loading_19.gif").css("width", "19px")));
	$("#schedules").empty().append($("<div>").addClass("loadingImg").append($("<img>").attr("src","img/loading_19.gif").css("width", "19px")));
	//data取得リクエスト
	chrome.extension.sendRequest({event: "popup_open"});
	animateFooter();
});
