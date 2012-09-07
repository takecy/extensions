$(function() {

	var counter = 0;
	var baseUrl = "http://allbum.in/allbum/api/1/";
	var iconPath = "img/ameba_19.png";

	chrome.browserAction.setBadgeText({text : "-"});
	chrome.browserAction.setBadgeBackgroundColor({color : [76, 172, 38, 255]})

	//-----------------------------------------------------------------------
	//ログイン中ユーザーID取得
	//-----------------------------------------------------------------------
	var getOfficialAlbum = function() {
		$.get(baseUrl + "/official/face/album", function(_data){
			var $bodyHtml = $(_data);

			var personalUrl = $bodyHtml.find("div.userElement span.span_user a").attr("href");
			var uid = extractUid(personalUrl);

			localStorage.setItem("uid", uid);
			//取得完了を通知
			chrome.extension.sendRequest({event: "gotUid"});
		});
	}


	function Notify() {
		this.event
		this.eventLink
		this.name
		this.nameLink
		this.date
		//ワークフローなどの確認要項目か
		this.isConfirmRequired = false;
	}


	//-----------------------------------------------------------------------
	//アイコン回転
	//-----------------------------------------------------------------------
	var rotateIcon = function() {
		var canvas = $("<canvas>").attr("width","19").attr("height","19")[0];
		var icon = new Image();
		icon.src = iconPath;

		//コンテキストの取得
		var ctx = canvas.getContext('2d');
		//canvasの高さと幅
		var canvasWidth = canvas.width;
		var canvasHeight = canvas.height;
		//中心座標
		var cx = canvasWidth / 2;
		var cy = canvasHeight / 2;

		//中心座標を移動
		ctx.translate(cx, cy);
		var count = 0;
		//1回の回転処理
		var rotate = function() {
			//1回の回転角度
			var rotationAngle = 10;
			//総回転角度
			var rotationAllAngle = 360*2;
			//canvas消去
			ctx.clearRect(-cx, -cy, canvasWidth, canvasHeight);
			//回転実行
			ctx.rotate(rotationAngle * Math.PI / 180);
			//描画
			ctx.drawImage(icon, -cx, -cy, canvasWidth, canvasHeight);
			//アイコン設定
			chrome.browserAction.setIcon({imageData : ctx.getImageData(0, 0, canvasWidth, canvasHeight)});
			//回転終わったら実行解除
			if(++count >= (rotationAllAngle / rotationAngle)) clearInterval(timer);
		};
		//定期実行
		var timer = setInterval(rotate, 1);
	};

	//-----------------------------------------------------------------------
	//sendRequest受信用
	//-----------------------------------------------------------------------
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if(request.event === "link_click") {
            getUid();
            getNotifies();
            getSchedules();
		} else if(request.event === "popup_open") {
			getUid();
			getNotifies();
            getSchedules();
        } else if(request.event === "tab_change" || request.event === "refresh") {
            getNotifies();
            getSchedules();
		} else if(request.event === "get_uid"){
			getUid();
        } else if(request.event === "get_notifies"){
            getNotifies();
        } else if(request.event === "get_schedules"){
            getSchedules();
        } else sendResponse({});
	});


	//-----------------------------------------------------------------------
	//Omnibox処理
	//-----------------------------------------------------------------------
	chrome.omnibox.onInputChanged.addListener(function(text, suggest) {

		var searchUrl = baseUrl + "/cgi-bin/cbgrn/grn.cgi/schedule/index?gid=search&search_text=" + text;

		var suggestArrayDefault = new Array(2);
		var schedule = new Suggest();
		schedule.description = "スケジュール";
		schedule.content = "/cgi-bin/cbgrn/grn.cgi/schedule/index?";
		suggestArrayDefault[0] = schedule;

		var notification = new Suggest();
		notification.description = "未確認通知";
		notification.content = "/cgi-bin/cbgrn/grn.cgi/notification/pending_list?";
		suggestArrayDefault[1] = notification;

		suggest(suggestArrayDefault);

		if(text.length < 4) return;

		$.get(searchUrl, function(_data){
			var $bodyHtml = $(_data);
			var users = $bodyHtml.find("td.calendar_rb_week div.userElement")
								 .find("span.span_user");

			var suggestArray = new Array(users.length);
			users.each(function(index){
				var suggest = new Suggest();
				suggest.description = $(this).find("a").text();
				suggest.content = $(this).find("a").attr("href");
				suggestArray[index] = suggest;
			});

			var schedule = new Suggest();
			schedule.description = "/cgi-bin/cbgrn/grn.cgi/schedule/index?";
			schedule.content = "スケジュール";

			var notification = new Suggest();
			notification.description = "/cgi-bin/cbgrn/grn.cgi/notification/pending_list?";
			notification.content = "未確認通知";

			suggest(suggestArray);
		});
	});

	chrome.omnibox.onInputEntered.addListener(function(text) {
		var url = baseUrl + text;
		navigate(url);
	});

	//選択中タブを更新
	function navigate(url) {
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.update(tab.id, {url : url});
		});
	}

	function Suggest(){
		this.content
		this.description
	}

    //-----------------------------------------------------------------------
	//定期更新
    //-----------------------------------------------------------------------
    //お知らせチェック
	setInterval(function() {
		getNotifies();
	}, 5*60*1000);

	//アイコン回転
	setInterval(function() {
		var lastNotifies = localStorage.getItem("notifies");
		if(lastNotifies === null)
			return;
		else
			lastNotifies = JSON.parse(lastNotifies);

		if(lastNotifies.length > 0) rotateIcon();

	}, 1*60*1000);

    //スケジュール(localStorageに保存されているもの)
    setInterval(function() {
        var schedules = localStorage.getItem("schedules");
        if(schedules === null)
            return;
        else
            schedules = JSON.parse(schedules);

        //notification表示
        $.each(schedules, function(index, schedule){
            var nowDate = new Date();
            var scheDate = schedule.startTime;
            var scheHour = parseInt($.trim(scheDate.split(":")[0]));
            var scheMinute = parseInt($.trim(scheDate.split(":")[1]));
            var scheDateObj = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), scheHour, scheMinute);

            var remainMinutes = parseInt((scheDateObj.getTime() - nowDate.getTime())/60/1000);

            if(0 > remainMinutes || remainMinutes > 15) return;

            if(remainMinutes == 0)　{
                showNotification(schedule, "時間です", 10);
                return;
            }

            var message = remainMinutes + "分前";

            if(remainMinutes == 15)　{
                showNotification(schedule, message, 10);
                return;
            }

            if(remainMinutes == 10)　{
                showNotification(schedule, message, 10);
                return;
            }

            if(remainMinutes > 5) return;
            //5分前以降
            showNotification(schedule, message, 5);
        });
    }, 55*1000);

    //notification表示
    var showNotification = function(schedule, message, closeSec){
        var　notification = webkitNotifications.createNotification(iconPath, message, schedule.content + " @ " + schedule.place);
        notification.show();
        //表示されてから5秒で閉じる
        notification.ondisplay = function() {
            setTimeout(function() {
                notification.cancel();
            }, closeSec * 1000);
        };
    }


	//-----------------------------------------------------------------------
	//background処理
	//-----------------------------------------------------------------------
	getUid();
	getNotifies();
	getSchedules();
});
