var episodeLinks = $('table.listing a').map(function(i,el) { return $(el).attr('href'); });
var episodeNames = $('table.listing a').map(function(i,el) { return $.trim( $(el).html() ); });

$.ajaxSetup({async:false});
$.getScript("http://www.kiss-anime.me/Scripts/asp.js");

var i;
var linkStr = "";

for (i = (episodeLinks.length - 1); i >= 0; i--) {
	jQuery.ajax({
		url: episodeLinks[i], 
		tryCount : 0,
		retryLimit : 3,
		success: function(result) {
			var $result = eval($(result));

   				var data = $(result).find("#divVideoJW");  // download data
				var links = $(data[0]).find("iframe");
				
				$.each(links, function(index, el) {
					long_url = $(el).attr('src');						
					name = getDownloadName(episodeNames[i], $(el).html());
					
					var linkStr = {"NAME":name,"URL":long_url}
					console.log(linkStr);
					return linkStr;
				});
			
		},error: function(xhr, textStatus, errorThrown ) {
			
			this.tryCount++;
			if (this.tryCount <= this.retryLimit) {
				$.ajax(this);
			}
			return;
		},
		async:   false, 
		script:  true
	});
}
function getDownloadName(epName, dl){
	return (epName + "__" + dl).replace(/\s/g, '_');
}
