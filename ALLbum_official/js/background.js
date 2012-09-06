$(function() {

	var counter = 0;
	var baseUrl = "https://caga.cyberagent.co.jp";
	var iconPath = "img/ameba_19.png";
	
	chrome.browserAction.setBadgeText({text : "-"});
	chrome.browserAction.setBadgeBackgroundColor({color : [76, 172, 38, 255]})
	
	//-----------------------------------------------------------------------
	//ログイン中ユーザーID取得
	//-----------------------------------------------------------------------
	var getUid = function() {
		$.get(baseUrl + "/cgi-bin/cbgrn/grn.cgi/portal/index?", function(_data){
			var $bodyHtml = $(_data);
			
			var personalUrl = $bodyHtml.find("div.userElement span.span_user a").attr("href");
			var uid = extractUid(personalUrl);

			localStorage.setItem("uid", uid);
			//取得完了を通知
			chrome.extension.sendRequest({event: "gotUid"});
		});
	}
	
	//URLからuid抽出
	var extractUid = function(url){
		var fromIndex = url.indexOf("uid=");
		if(fromIndex == -1) return "";
		var toIndex = url.indexOf("&", fromIndex + 1);
		var uid = url.substring(fromIndex+4, toIndex);
		return uid;
	}
	//URLから日付抽出
	var extractDate = function(url){
		var fromIndex = url.indexOf("bdate=");
		if(fromIndex == -1) return new Date();
		var toIndex = url.indexOf("&", fromIndex + 1);
		//yyyy-mm-dd
		var date = url.substring(fromIndex+6, toIndex);
		var dateArray = date.split("-");
		return new Date(dateArray[0], dateArray[1], dateArray[2]);
	}
	

	//-----------------------------------------------------------------------
	//お知らせ情報取得
	//-----------------------------------------------------------------------
	var getNotifies = function() {
		$.ajax({
			type : "GET",
			url : baseUrl + "/cgi-bin/cbgrn/grn.cgi/notification/pending_list",
			dataType : "html",
			statusCode : {
				404 : function() {
					chrome.browserAction.setBadgeText({text:"-"});
					chrome.extension.sendRequest({event: "404"});
				}
			},
			success : function(_data) {
				var $bodyHtml = $(_data);
				
				var loginTabel = $bodyHtml.find("table.login");
				//ログイン画面だった場合
				if(loginTabel && loginTabel.length > 0){
					chrome.browserAction.setBadgeText({text:"-"});
					rotateIcon();
					chrome.extension.sendRequest({event: "401"});
					return;
				}
				
				var $notifis_1 = $bodyHtml.find("tr.lineone");
				var $notifis_2 = $bodyHtml.find("tr.linetwo");

				var notifies = new Array($notifis_1.length + $notifis_2.length);
				var i = 0;
				
				//確認済み要求イベント(ワークフローとか)
				$notifis_1.each(function(index) {
					var notify = new Notify();
					var $tds = $(this).find("td");

					$tds.each(function(index) {
						if(index === 1) {
							notify.event = $(this).find("a").text();
							notify.eventLink = baseUrl + $(this).find("a").attr("href");
						} else if(index === 3) {
							notify.name = $(this).find("a").text();
							var nameLinkBase = $(this).find("a").attr("href");
							var fromIndex = nameLinkBase.indexOf("'");
							var toIndex = nameLinkBase.indexOf("'", fromIndex+1);
							var nameLink = nameLinkBase.substring(fromIndex+1, toIndex);
							notify.nameLink = baseUrl + nameLink;
						} else if(index === 4) {
							notify.date = $(this).text();
						}
					});

					notifies[i] = notify;
					i++;
				});
				
				//スケジュールの変更通知
				$notifis_2.each(function(index) {
					var notify = new Notify();
					var $tds = $(this).find("td");

					$tds.each(function(index) {
						if(index === 1) {
							notify.event = $(this).find("a").text();
							notify.eventLink = baseUrl + $(this).find("a").attr("href");
						} else if(index === 3) {
							notify.name = $(this).find("a").text();
							var nameLinkBase = $(this).find("a").attr("href");
							var fromIndex = nameLinkBase.indexOf("'");
							var toIndex = nameLinkBase.indexOf("'", fromIndex+1);
							var nameLink = nameLinkBase.substring(fromIndex+1, toIndex);
							notify.nameLink = baseUrl + nameLink;
						} else if(index === 4) {
							notify.date = $(this).text();
						}
					});
					
					notifies[i] = notify;
					i++;
				});
				
				var lastNotifies = localStorage.getItem("notifies");
				//初回
				if(!lastNotifies)
					lastNotifies = [];
				else
					lastNotifies = JSON.parse(lastNotifies);

				//件数設定
				chrome.browserAction.setBadgeText({text:String(notifies.length)});
				
				//新規イベント検索
				var updateCount = 0;
				$.each(notifies, function(i){
					var isNew = true;
					var notify = this;
					$.each(lastNotifies, function(j){
						if(notify.eventLink === this.eventLink) {
							isNew = false;
							return;
						}
					});
					if(!isNew) return;
					updateCount++;
				});
				
				//初回
				if(lastNotifies.length == 0 && notifies.length > 0)
					updateCount = notifies.length;
				
				//新規イベントの場合notification
				if(updateCount > 0) {
					var notification = webkitNotifications.createNotification(iconPath, '更新発見', updateCount + ' 個のイベントが更新されました');
					notification.show();
					//表示されてから5秒で閉じる
					notification.ondisplay = function() {
						setTimeout(function() {
							notification.cancel();
						}, 5*1000);
					};
				}
				
				//未確認がある場合はアイコン回転
				if(notifies.length > 0) rotateIcon();
				
				localStorage.setItem("notifies", JSON.stringify(notifies));
				window.notifies = notifies;
				//取得完了を通知
				chrome.extension.sendRequest({event: "gotNotifies"});
			}
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
	//今日のスケジュール取得
	//-----------------------------------------------------------------------
	var getSchedules = function() {
	    var uid = localStorage.getItem("uid");
		if(!uid)
		  chrome.extension.sendRequest({event : "uid_empty"});
		
		var url = baseUrl + "/cgi-bin/cbgrn/grn.cgi/schedule/personal_day?uid=" + uid;
		$.get(url, function(_data) {
			var $bodyHtml = $(_data);

			var loginTabel = $bodyHtml.find("table.login");
			//ログイン画面だった場合
			if(loginTabel && loginTabel.length > 0) {
				chrome.extension.sendRequest({
					event : "401"
				});
				return;
			}

			var $schedules = $bodyHtml.find("div.showtime div.critical");
			
			var schedules = new Array($schedules.length);

			$schedules.each(function(index) {
				var schedule = new Schedule();
				
				var full = $(this).text();
				var spaceIndex = full.search("\\s");
				schedule.startTime = full.substring(0, spaceIndex);
				
				//30pxが一時間分
				var hour = $(this).height();
				schedule.hour = $(this).height()/30;
				
				var contentFull = $(this).find("a").text();
				var fromIndex = contentFull.indexOf("[")+1;
				var toIndex = contentFull.indexOf("]");

                if(toIndex != -1) {
                    schedule.content = $.trim(contentFull.substring(0, fromIndex - 1));
                    schedule.place = contentFull.substring(fromIndex, toIndex);
                } 
                //場所なし
                else {
                    schedule.content = contentFull;
                }

				schedule.link = baseUrl + $(this).find("a").attr("href");
				
                //重複検索
                var $overlap = $(this).find("span.attention");
                schedule.overlap = ($overlap.length > 0);
                
				schedules[index] = schedule;
			});

			localStorage.setItem("schedules", JSON.stringify(schedules));
			window.schedules = schedules;
			//取得完了を通知
			chrome.extension.sendRequest({event : "gotSchedules"});
		});
	}
	
	function Schedule(){
		this.startTime
		this.endTime
		this.hour
		this.content
		this.place = "未設定";
		this.link
		this.overlap = false;
	}
	
	// Schedule.prototype.getSchedules = getSchedules;
	

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
