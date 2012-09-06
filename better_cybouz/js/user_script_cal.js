$(function() {

	var baseUrl = "https://caga.cyberagent.co.jp";
	
	//日スケジュール取得
	var getDaySchedule = function(uid, date) {
		//date:yyyy-MM-dd
		var daySchedule = "https://caga.cyberagent.co.jp/cgi-bin/cbgrn/grn.cgi/schedule/personal_day?"
		var dateQuery = "bdate=" + date;
		var uidQuery = "&uid=" + uid;

		$.get(daySchedule + dateQuery + uidQuery, function(_data) {
			var $bodyHtml = $(_data);
			var $schedules = $("div.showtime div.critical");
		});
	};
	
	//スケジュール情報取得
	var getEvents = function() {
		var $schedules = $("div.showtime div.critical");
		
		var events = [];
		$schedules.each(function(index) {
			var event = new Object();
			event.title = $(this).find("a").text();
			var link = baseUrl + $(this).find("a").attr("href");
			event.eventId = extractEventId(link);
			event.url = "https://caga.cyberagent.co.jp/cgi-bin/cbgrn/grn.cgi/schedule/view?event=" + event.eventId;
			events[index] = event;
		});
		return events;
	};
	//URLからeventId抽出
	var extractEventId = function(url) {
		var fromIndex = url.indexOf("event=");
		if(fromIndex == -1) return "";
		var toIndex = url.indexOf("&", fromIndex + 1);
		var eventId = url.substring(fromIndex + 4, toIndex);
		return eventId;
	}
	
	//スケジュール設定
	var setCalender = function() {
		$("#view").css("width", "70%").css("margin", "0 auto");
		$("#view a").css("color", "#333");
		$("#view a:hover").css("decolation", "underline");
		$("#schedule_calendar").hide();
		$("#navi_cal_label_on").hide();
		$("div#view form table.scheduleWrapper tbody tr").css("max-height", "20px");
		$(".critical").css("overflow", "hidden").css("border", "1px solid #888888").css("border-radius", "2px").css("box-shadow", "2px 2px 3px #999999");
		$("table.scheduleWrapper tbody tr td").css("font-size", "0.85em");
		
		$(".critical").each(function(){
			$(this).find("a").attr("title", $(this).text())
		});
	};

	//-------------------------------
	//処理
	//-------------------------------
	var events = getEvents();
	setCalender();
});
