$(function() {

    //API url
    var hatenaApi = 'http://b.hatena.ne.jp/entry/jsonlite/';
    var likeApi = 'https://graph.facebook.com/';
    var tweetApi = 'http://urls.api.twitter.com/1/urls/count.json?url=';

	var setFavicon = function() {
		var $links = $('div#ires ol#rso li.g div.vsc h3.r a.l');
		
		$links.each(function(index) {
            var $targetObj = $(this).parent();
			//設定済み
			if($targetObj.find('img.favicon').length > 0) return;
			
            //-------------------------------------------------------------------------
			//favicon
			var url = $(this).attr('href');
			var faviconUrl = 'http://favicon.st-hatena.com/?url=' + url;
			var $faviconImage = $('<img>').attr('src', faviconUrl).addClass('favicon');
            $targetObj.prepend($faviconImage);
			
			//-------------------------------------------------------------------------
            //social count
            //表示部全体
			var $sbmDiv = $('<div>').addClass('sbm_count');
			$targetObj.append($sbmDiv);
			
	        var $commentDiv = $('<div>').addClass('comments');
            $targetObj.append($commentDiv.hide());

			
            //service icon
            var $hatenIcon = $('<img>').addClass('icon').attr('src', 'http://dl.dropbox.com/u/2494314/favicon/hatebu.png');
            var $likeIcon = $('<img>').addClass('icon').attr('src', 'http://dl.dropbox.com/u/2494314/favicon/like.jpg');
            var $tweetIcon = $('<img>').addClass('icon').attr('src', 'http://dl.dropbox.com/u/2494314/favicon/twitter.png');
            
            //1service分のとこ
            var $hatenaSpan = $('<span>').attr('title','hatena').addClass('service').addClass('hatena').append($hatenIcon);
            var $likeSpan = $('<span>').attr('title','like').addClass('service').addClass('like').append($tweetIcon);
            var $tweetSpan = $('<span>').attr('title','tweet').addClass('service').addClass('tweet').append($likeIcon);
            
            $sbmDiv.append($hatenaSpan).append($likeSpan).append($tweetSpan);
            
            //hatena
            setSbmInfo($hatenaSpan, url, hatenaApi, $hatenIcon, 'hatena', function(json){
                if(json) return json['count'];
                return 0;
            },
            function(json){
            	if(json) return json['entry_url'];
            	return '';
            },
            function(json, targetObj) {
                if(!json) return;
                var bookmarks = json['bookmarks'];
                targetObj.empty();
                
                $.each(bookmarks, function(index, bookmark) {
                    var comment = bookmark['comment'];
                    if(!comment) return;
                    var userId = bookmark['user'];
                    var date = dd = new Date(bookmark['timestamp']);
                    var dateString = '[' + date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ']';

                    $rowDiv = $('<div>').addClass('row');
                    $userIcon = $('<img>').attr('title', userId).attr('src', 'http://n.hatena.com/' + userId + '/profile/image.gif?type=face&size=16');
                    $userSpan = $('<span>').addClass('user').append($userIcon).css('margin', '0 3px 0 0');
                    $dateSpan = $('<span>').addClass('date').text(dateString).css('margin', '0 3px 0 0');
                    $commentSpan = $('<span>').addClass('comment').text(comment);
                    targetObj.append($rowDiv.append($userSpan).append($dateSpan).append($commentSpan));
                });
                
                console.log(targetObj.find('.row').length);
                
                if(targetObj.find('.row').length == 0)
                	targetObj.append($('<div>').addClass('row').text('コメントなし'));
                
            }, $commentDiv);

            
            //like
            setSbmInfo($likeSpan, url, likeApi, $likeIcon, 'like', function(json){
                var count = json['shares'];
                if(!count) return 0;
                return count;
            });
            
            //tweet
            setSbmInfo($tweetSpan, url, tweetApi, $tweetIcon, 'tweet', function(json){
                return json['count'];
            });
            
		});
	};
	
    //カウント情報取得
    //getCountFunction：戻り値のJSONからCountを抜き出す関数
    var setSbmInfo = function(countObj, 
    							targetUrl, 
    							apiUrl, 
    							iconImage, 
    							serviceName, 
    							getCountFunction,
    							getSbmLinkFunction,
    							getCommentsFunction,
    							commentObj) {
        
        var $loadingIcon = $('<img>').addClass('loading').attr('src', 'http://dl.dropbox.com/u/2494314/favicon/loading.gif');
        var $countSpan = $('<span>').addClass(serviceName).addClass('count');
        $countSpan.append($loadingIcon);
        countObj.append(iconImage).append($countSpan);

        $.ajax({
            type : 'GET',
            url : apiUrl + targetUrl,
            dataType : 'json',
            success : function(json, dataType){
                var count = parseInt(getCountFunction(json));
                console.log(serviceName + ':');
                console.log(json);
                console.log(serviceName + ':' + count + ':' + targetUrl);
                
                //----------------------------------
                //set sbm count
                if(count < 10) $countSpan.css('backgroundColor', '#7aacf3');
                else if(count >= 10) $countSpan.css('backgroundColor', '#5c91dd');
                else if(count >= 100) $countSpan.css('backgroundColor', '#3e72bd');
                else if(count >= 300) $countSpan.css('backgroundColor', '#285f97');
                
                //sbm link
                if(getSbmLinkFunction != undefined & count > 0){
                	var $sbmLink = $('<a>').attr('href', getSbmLinkFunction(json)).text(count);
                	$countSpan.empty().append($sbmLink);
                } else {
                    $countSpan.empty().text(count);
                }
                
                //----------------------------------
                //set comments
                if(getCommentsFunction != undefined & count > 0){
                    commentObj.append($loadingIcon);
                    commentObj.click(function(){
                        $(this).slideUp(500);
                    });

                    $sbmLink.hover(function(){
                        getCommentsFunction(json, commentObj.slideDown());
                    },
                    function(){
                    });
                }
            },
            error : function(){
                $countSpan.empty().text('error').css('backgroundColor', '#a29d99');
            }
        });
    }
    
	//AutoPagerizeでページが継ぎ足されたイベントをbind
	$('body').on('AutoPagerize_DOMNodeInserted', function(){
		setFavicon();
	});
	
	

	// chrome.tabs.onUpdated.addListener(function(tabid, inf) {
		// if(inf.status === 'complete') {
			// chrome.pageAction.show(tabid);
			// chrome.pageAction.setIcon({
				// tabId : tabid,
				// path : 'icon.png'
			// });
		// }
	// });


	setFavicon();
});
