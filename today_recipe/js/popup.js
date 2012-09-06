$(function() {

	var setRecipes = function(recipes) {
		$("#main").empty();
		$(recipes).each(function(index, recipe) {

			var $content = $("<div>").addClass("content");
			var $discription = $("<div>").addClass("discription");

			var $title = $("<div>").text(recipe.title).addClass("title");
			var $linkImage = $("<img>").attr("src", "img/link_24.png").attr("title", "タブで開く").attr("width", "20");
			var $link = $("<a>").attr("href", recipe.link).append($linkImage).addClass("link");
			var $picture = $("<img>").attr("src", recipe.picture).addClass("picture").fadeIn("3000");

			$discription.append($title);
			$discription.append($link);
			$content.append($picture);
			$content.append($discription);

			$("#main").append($content);
		});
	}

    $(document).on("click", "a", function(){
		chrome.tabs.create({
			url : $(this).attr("href"),
			active : true
		})
	});
	
	//--------------------------------------------------
	//表示時処理
	//--------------------------------------------------
	var loadingImage = $("<img>").attr("src", "img/loading_19.gif");
	$("#main").append($("<div>").addClass("loadingImg").append(loadingImage));

	var background = chrome.extension.getBackgroundPage();
	var recipes = background.recipes;
	setRecipes(recipes);
});
