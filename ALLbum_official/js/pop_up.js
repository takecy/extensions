$(function() {

    var apiUrl = "http://allbum.in/allbum/api/1/official/album/face"
    
    // face info GET
    var getFaceAlbum = function(apiUrl, callback) {
        
        var faceAlbums = new Array();
        
        $.get(apiUrl, function(res) {
            console.log(res);
            var data = res.response.data;
            $.each(data, function(index, row) {
                console.log(index);
            	console.log(row);
            	
            	var faceAlbum = new FaceAlbum();
            	faceAlbum.id = row.id;
            	faceAlbum.name = row.name;
            	if(row.coverPhoto)
            	    faceAlbum.coverUrl = row.coverPhoto.url;
            	faceAlbum.privacy = row.privacy;
            	faceAlbum.photos = row.photos.data;
            	
            	console.log(faceAlbum);
            	
            	faceAlbums.push(faceAlbum);
            	
            });
            
            callback(faceAlbums);
        });
        
    };
    
    //execute
    getFaceAlbum(apiUrl, function(faceAlbums){
        console.log(faceAlbums);
        
        var $populars = $("#populars");
        var $ul = $("<ul>").addClass("thumbnails");

        $.each(faceAlbums, function(index, album) {
            var $li = $("<li>").addClass("span2");
            var $thumbnail = $("<div>").addClass("thumbnail");
            var $img = $("<img>").attr("src", album.coverUrl).attr("title", album.name);
            var $caption = $("<p>").addClass("caption").text(album.name);
            
            $populars.append($ul.append($li.append($thumbnail.append($img).append($caption))));
            //$populars.append($ul.append($li.append($img).append($caption)));
        });
        
        
    });
    
    //constructor
    var FaceAlbum = function() {
    	this.id;
    	this.name;
    	this.coverUrl;
    	this.photos;
    	this.privacy;
    }

});