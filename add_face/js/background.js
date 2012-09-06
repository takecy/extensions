$(function() {

	var baseUrl = "https://caga.cyberagent.co.jp";

	var setImage = function() {
		//リンクを探す
		var $empLink = $("a");
		
        //cache取得
        var empCaches = localStorage.getItem("empCaches");
        if(!empCaches) 
            empCaches = [];
        else 
            empCaches = JSON.parse(empCaches);

		$empLink.each(function(index) {
			var uid = extractUid($(this).attr("href"));
			if(!uid) return;
			
			getEmpInfo(uid, $(this), empCaches);
		});
	}
	
	//uid抽出
	var extractUid = function(url){
		if(!url) return "";
		var fromIndex = url.indexOf("user_view?uid=");
		if(fromIndex == -1) return "";
		
		var toIndex = url.indexOf("&", fromIndex + 1);
		if(toIndex == -1) toIndex = url.indexOf("'", fromIndex + 1);
		
		var uid = url.substring(fromIndex+14, toIndex);
		return uid;
	}
	
	//個別ページからmailと画像を取得して設定
	var getEmpInfo = function(uid, object, empCaches){
        var empUrl = baseUrl + "/cgi-bin/cbgrn/grn.cgi/grn/user_view?uid=" + uid;
        
        //cache検索
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
            empCaches.push(emp);
            localStorage.setItem("empCaches", JSON.stringify(empCaches));
			setEmpInfo(emp, object);
		});
	};
	
	//cache検索
	var searchCache = function(empCaches, uid){
	    for(var i in empCaches){
            if(uid == empCaches[i].uid) return empCaches[i];
        };
        return null;
	};
	
	//設定
	var setEmpInfo = function(emp, object) {
		var imageSize = 40;
		var $mailTo = $("<a>").attr("href", "mailto:" + emp.email).attr("title", "メールする");

		var imageUrl = emp.imageUrl;
		if(!imageUrl)
			imageUrl = "http://dl.dropbox.com/u/49715397/img/no_image.png";
		else
			imageUrl = baseUrl + imageUrl;
		
		var $imageFace = $("<img>").attr("src", imageUrl).attr("width", imageSize).css("padding", "0 0 0 5px");
		var $imageLink = $mailTo.append($imageFace);

		object.prepend($imageLink.fadeIn("2000"));
	}
	
	
	function Emp(uid, email, imageUrl){
	    this.uid = uid;
		this.email = email;
		this.imageUrl = imageUrl;
	}


	//-------------------------
	//処理	
	//-------------------------
	setImage();
});
