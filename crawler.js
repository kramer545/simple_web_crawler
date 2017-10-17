/*
Ryan Kramer

This program is a simple web crawler using Node.js to traverse all links from the given url within its domain 
until no pages are left and afterwords to output the urls of each static asset from each page

Uses three libraries, url-parse to parse the url
*/

var URL = require('url-parse');
var request = require('request');
var cheerio = require('cheerio');

var numNextPages = 0;
var visitedPages = new Set(); //pages we parsed already, don't repeat, set doesnt allow duplicates
var nextPages = []; //stack of unvisited pages to parse, order doesnt matter
var firstURL;

//var jsonObject = new Object(); //object, where each index is a url, which each has a array of assets

//Handles cmd line input for url
if(typeof process.argv[2] == "undefined") //if no url given, use sample url
{
	console.log("url input undefined, using https://accelerateokanagan.com");
	firstURL = "https://accelerateokanagan.com";
}
else //url given, use that
{
	firstURL = process.argv[2]
}

nextPages.push(firstURL);
var url = new URL(firstURL);
var baseURL = url.protocol + "//" + url.hostname;
numNextPages = 1;
crawl();

function crawl()
{
	if(numNextPages == 0)
	{
		console.log("No more pages");
		return;
	}
	else
	{
		var nextPage = nextPages.pop();
		if(typeof nextPage == "undefined")
		{
			console.log("No more pages");
			return;
		}
		numNextPages--;
		//console.log(nextPage +" "+numNextPages);
		if(nextPage in visitedPages)
		{
			crawl();
		}
		else
		{
			visitPage(nextPage);
		}
	}
}
function visitPage(url) //visit a single page, and get its sublinks and asset urls
{
	//console.log("Visiting page " + url); //debug purposes
	request(url, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		 var jsonObject = new Object();
		 
		 //finding links
		 jsonObject.url = url;
		 visitedPages[url] = true;
		 var assets = [];
		 getLinks(body);
		 //assets
		 getImgs(body,assets);
		 getScripts(body,assets);
		 getStyle(body,assets);
		 jsonObject.assets = assets;
		 
		 console.log(JSON.stringify(jsonObject,null,4) +"\n"); //prints json object using 4 spaces for indentation
		 crawl();
	   }
	   else
	   {
		   crawl();
		   return;
	   }
	});
}

function getLinks(body) //get sublinks for traversing
{
	var relativeLinks = body("a[href^='/']");
	//console.log("Found " + relativeLinks.length + " relative links on page");
	relativeLinks.each(function() {
		if(baseURL + body(this).attr('href') !== baseURL + "/")
		{
			//console.log(baseUrl + body(this).attr('href'));
			nextPages.push(baseURL + body(this).attr('href'));
			numNextPages++;
		}
	});
}

function getImgs(body, assets) //get urls of images on curr page
{
	var assetLinks = body('img');
	assetLinks.each(function() {
		assets.push(baseURL + body(this).attr("src"));
		numNextPages++;
	});
}

function getScripts(body,assets) // get non-dynamic script urls for curr page
{
	assetLinks = body("script");
	assetLinks.each(function() {
		if(body(this).attr("src")) //this prevents adding dynamic script urls, which end up broken
			assets.push(baseURL + body(this).attr("src"));
	});
}

function getStyle(body,assets) // get stylesheets from curr page
{
	//Stylesheets are done via links, but need to check .rel if it is actually a stylesheet
	assetLinks = body('link');
	assetLinks.each(function() {
		if(body(this).attr("rel") == "stylesheet")
			assets.push(baseURL + body(this).attr("href"));
	});
}