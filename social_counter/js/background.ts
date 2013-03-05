/// <reference path="jquery.d.ts" /> 

module sbm_counter {
	
	class Urls {
		private hatena: string = 'http://b.hatena.ne.jp/entry/jsonlite/';
		private facebook: string = 'https://graph.facebook.com/';
		private twitter: string = 'http://urls.api.twitter.com/1/urls/count.json?url=';

		constructor() {

		};

		getHatena(): string {
			return this.hatena;
		}
		getFb(): string {
			return this.facebook;
		}
		getTwitter(): string {
			return this.twitter;
		}

	}

	/**
	* カウント取得
	*/
	class countService {

		getCount(apiUrl: string, targetUrl: string): number {
			$.ajax({
	            type : 'GET',
	            url : apiUrl + targetUrl,
	            dataType : 'json',
	            success : function(json, dataType){
	                var count = parseInt(json);
	                return count;
	            },
	            error : function() {
	            	//TODO
	            }
	        });
			return null;
		}
	}
}