/*
Ryan Kramer

This program is a simple web crawler using Node.js to traverse all links from the given url within its domain 
until no pages are left and afterwords to output the urls of each static asset from each page

Uses three libraries, url-parse to parse the url to get the protocol and hostname, request to load a webpage, and cheerio is a html parser for finding elements
*/

//Initilize program parameters
var URL = require('url-parse');
var request = require('request');
var cheerio = require('cheerio');

var numNextPages = 0;
var visitedPages = new Set(); //pages we parsed already, don't repeat, set doesnt allow duplicates
var nextPages = []; //stack of unvisited pages to parse, order doesnt matter
var baseURL;

//Handles cmd line input for url
if(typeof process.argv[2] == "undefined") //if no url given, use sample url
{
	console.log("url input undefined, using https://accelerateokanagan.com");
	baseURL = "https://accelerateokanagan.com";
}
else //url given, use that
{
	baseURL = process.argv[2]
}

nextPages.push(baseURL); //add first page to pages to visit
numNextPages = 1;

var URL = new URL(baseURL);
baseURL = URL.protocol + "//" + URL.hostname; //used for getting full url of local assets/links

crawl(); //starts crawl / program

function crawl() //checks if all pages are visited, otherwise loads the next one via visitPage(), called each time a page is done
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
			console.log("Trying to load undefined page, cancelling");
			return;
		}
		numNextPages--;
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
	request(url, function(error, response, body) {
	   if(error) { //something went wrong, just return
		 console.log("Error: " + error);
		 crawl();
		 return;
	   }
	   // status code 200 means good
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 var jsonObject = new Object();
		 
		 //finding links
		 jsonObject.url = url;
		 visitedPages[url] = true;
		 var assets = [];
		 getLinks(body);
		 
		 //getting assets
		 getImgs(body,assets);
		 getScripts(body,assets);
		 getStyle(body,assets);
		 jsonObject.assets = assets;
		 
		 console.log(JSON.stringify(jsonObject,null,4) +"\n"); //prints json object using 4 spaces for indentation, done inside request so runs after all assets added
		 crawl(); //call for next page check, crawl() will stop itself if nothing new is left
	   }
	   else //bad status code, not error
	   {
		   crawl();
		   return;
	   }
	});
}

function getLinks(body) //get sublinks for traversing
{
	var relativeLinks = body("a[href^='/']");
	relativeLinks.each(function() {
		if(body(this).attr('href').charAt(0) === "/") //check if link starts with '/' (relative link)
		{
			nextPages.push(baseURL + body(this).attr('href'));
			numNextPages++;
		}
		else if(body(this).attr('href').startsWith(baseURL)) //For absolute links within domain, doesn't add baseURL as is already includes it
		{
			nextPages.push(body(this).attr('href'));
			numNextPages++;
		}
	});
}

function getImgs(body, assets) //get urls of images on curr page
{
	var currSet = new Set(); //prevents duplicate imgs
	var assetLinks = body('img');
	assetLinks.each(function() {
		if(!currSet.has(baseURL + body(this).attr("src")))
		{
			currSet.add(baseURL + body(this).attr("src"));
			assets.push(baseURL + body(this).attr("src"));
		}
	});
}

function getScripts(body,assets) // get non-dynamic script urls for curr page
{
	var currSet = new Set(); //prevents duplicate scripts (unlikely to happen, but you never know)
	assetLinks = body("script");
	assetLinks.each(function() {
		if((!currSet.has(baseURL + body(this).attr("src"))) && (body(this).attr("src"))) //this prevents adding dynamic script urls, which end up broken
		{
			currSet.add(baseURL + body(this).attr("src"));
			assets.push(baseURL + body(this).attr("src"));
		}
	});
}

function getStyle(body,assets) // get stylesheets from curr page
{
	var currSet = new Set(); //prevents duplicate stylesheets
	//Stylesheets are done via links, but need to check .rel if it is actually a stylesheet
	assetLinks = body('link');
	assetLinks.each(function() {
		if((!currSet.has(baseURL + body(this).attr("href"))) && ((body(this).attr("rel") == "stylesheet")))
		{
			currSet.add(baseURL + body(this).attr("href"));
			assets.push(baseURL + body(this).attr("href"));
		}
	});
}