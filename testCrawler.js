/*
Ryan Kramer

This program is a test version of the web crawler detailed in crawler.js, using a specific website and testing if it passes all tests
*/

var URL = require('url-parse');
var request = require('request');
var cheerio = require('cheerio');

var numNextPages = 0;
var visitedPages = new Set(); //pages we parsed already, don't repeat, set doesnt allow duplicates
var nextPages = []; //stack of unvisited pages to parse, order doesnt matter
var baseURL;

console.log("Using http://webscraper.io/test-sites/e-commerce/allinone");
baseURL = "http://webscraper.io/test-sites/e-commerce/allinone";

nextPages.push(baseURL);
numNextPages = 1;
runTests();

function runTests()
{
	console.log("\n");
	setCompareTest();
	firstLevelLinksTest();
}

function setCompareTest()
{
	var passed = true;
	var testSet = new Set();
	if(testSet.has("test"))
		passed = false;
	testSet.add("test");
	if(!testSet.has("test"))
		passed = false;
	if(passed)
		console.log("setCompareTest Passed");
	else
		console.log("setCompareTest Failed");
}

function firstLevelLinksTest() //tests if all links on base site are hit
{
	var numCorr = 0;
	var linkSet = new Set();
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/screenshots");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/tutorials");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/documentation");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/test-sites");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/help");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/service");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/data-specialist");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/test-sites/e-commerce/allinone"); //next few are weird as they are local, but since program goes off local href diffrences, likely reroute stuff
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/test-sites/e-commerce/allinone/computers");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/test-sites/e-commerce/allinone/phones");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/contact");
	request(baseURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		 var relativeLinks = body("a[href^='/']");
		 //console.log("Found " + relativeLinks.length + " relative links on page");
		 relativeLinks.each(function() {
			if(baseURL + body(this).attr('href') !== baseURL + "/")
			{
				//console.log(baseURL + body(this).attr('href'));
				var str = baseURL + body(this).attr('href');
				if(linkSet.has(str))
				{
					numCorr++;
				}
			}
		 });
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	   if(numCorr == linkSet.size)
		   console.log("firstLevelLinksTest Passed");
	   else
		   console.log("firstLevelLinksTest Failed");
	});
}

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
			console.log(baseURL + body(this).attr('href'));
			//nextPages.push(baseURL + body(this).attr('href'));
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