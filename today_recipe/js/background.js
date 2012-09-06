$(function() {

	var baseUrl = "http://www.nhk.or.jp/kurashi/ryouri/";
	var iconPath = "img/Recipe Book-32.png";
	
    chrome.browserAction.setBadgeText({text : "-"});
    chrome.browserAction.setBadgeBackgroundColor({color : [240, 97, 3, 255]})

    //レシピ取得
	var getTodayRecipes = function() {
		$.get(baseUrl, function(_data) {
			$body = $(_data);
			$cooks = $body.find("dl.c_fix");

			var _recipes = new Array($cooks.length - 1);
			var i = 0;
			$cooks.each(function(index, data) {
				$float_l = $(data).find(".float_l");
				$float_r = $(data).find(".float_r");

				var title = $float_r.find("p.bold").text();
				var link = $float_l.find("a").attr("href");
				var picture = $float_l.find("img").attr("src")

				if(!link) return;

				var recipe = new Recipe();
				recipe.title = title;
				recipe.link = baseUrl + link;
				recipe.picture = baseUrl + picture;

				_recipes[i] = recipe;
				i++;
			});

            var lastRecipes = localStorage.getItem("recipes");
            //初回
            if(!lastRecipes)
                lastRecipes = [];
            else
                lastRecipes = JSON.parse(lastRecipes);

            //新規イベント検索
            var updateCount = 0;
            $.each(_recipes, function(i){
                var isNew = true;
                var recipe = this;
                $.each(lastRecipes, function(j){
                    if(recipe.title === this.title) {
                        isNew = false;
                        return;
                    }
                });
                if(!isNew) return;
                updateCount++;
            });
            
            //初回
            if(lastRecipes.length == 0 && _recipes.length > 0)
                updateCount = _recipes.length;
            
            //新規イベントの場合notification
            if(updateCount > 0) {
                var notification = webkitNotifications.createNotification(iconPath, '更新あり', 
                                                                          '新しいレシピを' + updateCount +  '個発見！');
                notification.show();
                //表示されてから5秒で閉じる
                notification.ondisplay = function() {
                    setTimeout(function() {
                        notification.cancel();
                    }, 5*1000);
                };
            }

			localStorage.setItem("recipes", JSON.stringify(_recipes));
			
            //件数設定
            chrome.browserAction.setBadgeText({text:String(updateCount)});
            rotateIcon();

            window.recipes = _recipes;
			return recipes;
		});
	};
	
	function Recipe() {
		this.title
		this.link
		this.picture
	};
	
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
        //連続実行
        var timer = setInterval(rotate, 1);
    };


    //-----------------------------------------------------
    // 処理
    //-----------------------------------------------------
	getTodayRecipes();

    //定期実行
	setInterval(function() {
		getTodayRecipes();
	}, 60 * 60 * 1000);
});
