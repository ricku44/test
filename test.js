// python -m http.server
// http://localhost:8000/kissanime.js

// CONFIG
var siteName = "Kissanime"
var rootUrl = 'http://ww7.kiss-anime.me/'
var URL = window.location.origin
// END CONFIG


var episodeLinks = $('table.listing a').map(function(i,el) { return $(el).attr('href'); });
var episodeNames = $('table.listing a').map(function(i,el) { return $.trim( $(el).html() ); });

$.ajaxSetup({async:false});
$.getScript(rootUrl + "/Scripts/asp.js");

console.log('Starting ' + siteName + ' Batch Downloader script...');

var startEpisode;
do {
	startEpisode = Number(prompt("Enter episode (listing) number you want to start from", defaultText="1"));
	if(startEpisode <= 0 || startEpisode > episodeLinks.length) {
		alert("Episode number entered must be greater than 0 and lesser than total number of eps"); 
	} else {
		break; 
	}
} while(true);

var endEpisode;
do {
	endEpisode = Number(prompt("Enter episode (listing) number you want to end at", defaultText="2"));
	if(endEpisode <= 0 || endEpisode > episodeLinks.length || endEpisode < startEpisode) {
		alert("Episode number entered must be greater than 0 and lesser than total number of eps");
	} else {
		break;
	}
} while(true);

var videoQuality = prompt(
	"Enter video quality preferences for the download. Example - '720,480'\nThis first looks for 720p, if 720 is not available, it picks 480.", 
	defaultText=""
);

if (videoQuality == null){
	videoQuality = "720";
}

var opOptions = prompt(
	"How do you want output to be?\n0 = simple list of links\n1 = List with filenames (for wget, aria2 helper scripts)\n2 = HTML page with links",
	defaultText="0"
);

if (opOptions == null){
	opOptions = "0";
}

var i;
var linkStr = "";

console.log('Starting to fetch links..');

for (i = (episodeLinks.length - startEpisode); i >= (episodeLinks.length - endEpisode); i--) {
	console.log('Fetching listing ' + (episodeLinks.length - i) + ' [' + episodeNames[i] + ']');
	jQuery.ajax({
		url: episodeLinks[i], 
		tryCount : 0,
		retryLimit : 3,
		success: function(result) {
			var $result = eval($(result));
			
			// console.log(result.search("Save link as"));
			// console.log(result.search("divDownload"));

			var data = $(result).find("#divDownload");  // download data
			var links = $(data[0]).find("a");

			console.log(data);
			
			var quals = videoQuality.split(',');
			var found = false;
			// pick download
			for (var j=0; j<quals.length; j++){
				// check if the format exists or not
				if (found)
					return;

				$.each(links, function(index, el) {
					// console.log(el);
					if ( $(el).html().search(quals[j]) > -1 ){
						long_url = $(el).attr('href');
						console.log(long_url);
						
						name = getDownloadName(episodeNames[i], $(el).html());
						if (opOptions == "1"){
							linkStr += encodeURI(long_url) + " " + name + "\n";
							console.log(linkStr);
						} else if (opOptions == "2"){
							linkStr += '<a href="' + long_url + '" download="' + name + '">' + name + '</a><br>';
						} else {
							linkStr += long_url + "\n";
						}
						found = true;
						// console.log('Episode ' + (episodeLinks.length - i));
						console.log(long_url);
					}
				});
			}
			// successful response processed
		},
		error: function(xhr, textStatus, errorThrown ) {
			console.log(textStatus)
			// http://stackoverflow.com/questions/10024469/whats-the-best-way-to-retry-an-ajax-request-on-failure-using-jquery
			this.tryCount++;
			if (this.tryCount <= this.retryLimit) {
				//try again
				console.log('Retrying..');
				$.ajax(this);
			}
			return;
		},
		async:   false, 
		script:  true
	});
}

console.log('Opening list of links')
download("links." + ((opOptions == '2') ? 'html' : 'txt'), (opOptions == '2') ? 'text/html' : 'text/plain', linkStr)

// http://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, datatype, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:' + datatype + ';charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	// element.setAttribute('target', '_blank');
	// ^^ problems with safari

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function getDownloadName(epName, dl){
	return (epName + "__" + dl).replace(/\s/g, '_');
}
