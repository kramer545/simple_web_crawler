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
var firstURL = baseURL;
var URL = new URL(baseURL);
baseURL = URL.protocol + "//" + URL.hostname;
numNextPages = 1;
runTests();

function runTests()
{
	console.log("\n");
	setCompareTest();
	firstLevelLinksTest();
	addsNewPages(); //also includes traverseNextPages() if passed
	cssTest();
	scriptTest();
	imgTest();
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
	var currSet = new Set(); //prevents duplictate links for score, not needed as in program links are added to set, so no need to check
	linkSet.add("http://webscraper.io/");
	linkSet.add("http://webscraper.io/screenshots");
	linkSet.add("http://webscraper.io/tutorials");
	linkSet.add("http://webscraper.io/documentation");
	linkSet.add("http://webscraper.io/test-sites");
	linkSet.add("http://webscraper.io/help");
	linkSet.add("http://webscraper.io/service");
	linkSet.add("http://webscraper.io/data-specialist");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone"); //next few are weird as they are local, but since program goes off local href diffrences, likely reroute stuff
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/computers");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/phones");
	linkSet.add("http://webscraper.io/contact");
	request(firstURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		 var relativeLinks = body("a"); //looks for links that start with '/' as they are relative links that won't redirect outside domain
		 //console.log("Found " + relativeLinks.length + " relative links on page");
		 relativeLinks.each(function() {
			//if(baseURL + body(this).attr('href') !== baseURL + "/")
			if((body(this).attr('href').charAt(0) === "/") || (body(this).attr('href').startsWith(baseURL))) //check if link starts with '/' (relative link) or is absolute link of same domain
			//if(true)
			{
				var str = baseURL + body(this).attr('href');
				if(!currSet.has(str))
				{
					currSet.add(str);
					//console.log(baseURL + body(this).attr('href'));
					if(linkSet.has(str))
					{
						//console.log(str);
						numCorr++;
					}
				}
			}
		 });
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	   //console.log(numCorr +" "+ linkSet.size);
	   if(numCorr == linkSet.size)
		   console.log("firstLevelLinksTest Passed");
	   else
		   console.log("firstLevelLinksTest Failed");
	});
}

function addsNewPages()
{
	var numCorr = 0;
	var linkSet = new Set();
	var currSet = new Set(); //prevents duplictate links for score, not needed as in program links are added to set, so no need to check
	var nextPages = [];
	linkSet.add("http://webscraper.io/");
	linkSet.add("http://webscraper.io/screenshots");
	linkSet.add("http://webscraper.io/tutorials");
	linkSet.add("http://webscraper.io/documentation");
	linkSet.add("http://webscraper.io/test-sites");
	linkSet.add("http://webscraper.io/help");
	linkSet.add("http://webscraper.io/service");
	linkSet.add("http://webscraper.io/data-specialist");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone"); //next few are weird as they are local, but since program goes off local href diffrences, likely reroute stuff
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/computers");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/phones");
	linkSet.add("http://webscraper.io/contact");
	request(firstURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		 var relativeLinks = body("a"); //looks for links that start with '/' as they are relative links that won't redirect outside domain
		 //console.log("Found " + relativeLinks.length + " relative links on page");
		 relativeLinks.each(function() {
			//if(baseURL + body(this).attr('href') !== baseURL + "/")
			if((body(this).attr('href').charAt(0) === "/") || (body(this).attr('href').startsWith(baseURL))) //check if link starts with '/' (relative link) or is absolute link of same domain
			//if(true)
			{
				var str = baseURL + body(this).attr('href');
				if(!currSet.has(str))
				{
					currSet.add(str);
					nextPages.push(str);
					//console.log(baseURL + body(this).attr('href'));numCorr++;
				}
			}
		 });
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	   //console.log(numCorr +" "+ linkSet.size);
	   if(currSet.size == linkSet.size)
	   {
		   console.log("addsNewPages Passed");
		   traversesNextPages(nextPages);
	   }
	   else
		   console.log("addsNewPages Failed");
	});
}

function traversesNextPages(nextPages)
{
	var numCorr = 0;
	var newURL = nextPages.pop();
	
	//after first run where pages are retrived and stored in currSet
	request(newURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		 if((newURL != firstURL) && (typeof body != "undefined")) //check if new url and page exists
			 console.log("traverseNextPages Passed at URL: " + newURL);
		 else
			 console.log("traverseNextPages Failed");
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	});
}

function cssTest()
{
	var numCorr = 0;
	var passed = false;
	var cssValue = "http://webscraper.io/css/app.css"; //only one css file
	request(firstURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		 assetLinks = body('link');
		 assetLinks.each(function() {
			 if(((body(this).attr("rel") == "stylesheet")))
			 {
				if((baseURL + body(this).attr("href")) === cssValue)
					passed = true;
			 }
		 });
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	   //console.log(numCorr +" "+ linkSet.size);
	   if(passed)
		   console.log("cssTest Passed");
	   else
		   console.log("cssTest Failed");
	});
}

function scriptTest()
{
	var numCorr = 0;
	var passed = false;
	var scriptValue = "http://webscraper.io/js/app.js"; //only one static script
	request(firstURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		assetLinks = body("script");
		assetLinks.each(function() {
			if((body(this).attr("src")))
			 {
				if((baseURL + body(this).attr("src")) === scriptValue)
					passed = true;
			 }
		 });
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	   if(passed)
		   console.log("scriptTest Passed");
	   else
		   console.log("scriptTest Failed");
	});
}

function imgTest()
{
	var numCorr = 0;
	var passed = false;
	var currSet = new Set(); //prevents duplicate imgs, check if size is one
	var imgValue = "http://webscraper.io/images/test-sites/e-commerce/items/cart2.png"; //only one img, but there are multiple of it on page
	request(firstURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   //console.log("Status code: " + response.statusCode); //debug purposes
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 //console.log("Page title:  " + $('title').text());
		var assetLinks = body('img');
		assetLinks.each(function() {
			if(!currSet.has(baseURL + body(this).attr("src")))
			 {
				currSet.add(baseURL + body(this).attr("src"));
				if((baseURL + body(this).attr("src")) === imgValue)
					passed = true;
			 }
		 });
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	   if((passed) && (currSet.size == 1))
		   console.log("imgTest Passed");
	   else
		   console.log("imgTest Failed");
	});
}

