/*
Ryan Kramer

This program is a test version of the web crawler detailed in crawler.js, using a specific website and testing if it passes all tests
*/

var URL = require('url-parse');
var request = require('request');
var cheerio = require('cheerio');

console.log("Using http://webscraper.io/test-sites/e-commerce/allinone");
var baseURL = "http://webscraper.io/test-sites/e-commerce/allinone";

var firstURL = baseURL;
var URL = new URL(baseURL);
baseURL = URL.protocol + "//" + URL.hostname;

runTests();

function runTests() //runs all tests
{
	console.log("\n");
	setCompareTest();
	firstLevelLinksTest();
	addsNewPages(); //also includes traverseNextPages() if passed
	cssTest();
	scriptTest();
	imgTest();
}

function setCompareTest() //due to Set comparisions being used to remove/check duplicate links/assets, functionallity is tested here
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
	//Looked up links manually
	linkSet.add("http://webscraper.io/");
	linkSet.add("http://webscraper.io/screenshots");
	linkSet.add("http://webscraper.io/tutorials");
	linkSet.add("http://webscraper.io/documentation");
	linkSet.add("http://webscraper.io/test-sites");
	linkSet.add("http://webscraper.io/help");
	linkSet.add("http://webscraper.io/service");
	linkSet.add("http://webscraper.io/data-specialist");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/computers");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/phones");
	linkSet.add("http://webscraper.io/contact");
	request(firstURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 var relativeLinks = body("a");
		 relativeLinks.each(function() {
			if(body(this).attr('href').charAt(0) === "/") //check if link starts with '/' (relative link)
			{
				var str = baseURL + body(this).attr('href');
				if(!currSet.has(str))
				{
					currSet.add(str);
					//console.log(baseURL + body(this).attr('href')); //debug msg for testing on fail
					if(linkSet.has(str))
					{
						//console.log(str);
						numCorr++;
					}
				}
			}
			else if (body(this).attr('href').startsWith(baseURL))) // absolute link on same domain, don't add baseURL as its already included
			{
				var str = body(this).attr('href');
				if(!currSet.has(str)) //prevents duplicate links (here only for this page, real program has global link set
				{
					currSet.add(str);
					//console.log(body(this).attr('href')); //debug msg for testing on fail
					if(linkSet.has(str)) //check if link is one of the ones I know exists on test page
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
	   if(numCorr == linkSet.size) //if number of links match, then we have all the links without duplicates
		   console.log("firstLevelLinksTest Passed");
	   else
		   console.log("firstLevelLinksTest Failed");
	});
}

function addsNewPages() //tests if new page links are added/stored correctly
{
	var numCorr = 0;
	var linkSet = new Set();
	var currSet = new Set();
	var nextPages = [];
	linkSet.add("http://webscraper.io/");
	linkSet.add("http://webscraper.io/screenshots");
	linkSet.add("http://webscraper.io/tutorials");
	linkSet.add("http://webscraper.io/documentation");
	linkSet.add("http://webscraper.io/test-sites");
	linkSet.add("http://webscraper.io/help");
	linkSet.add("http://webscraper.io/service");
	linkSet.add("http://webscraper.io/data-specialist");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/computers");
	linkSet.add("http://webscraper.io/test-sites/e-commerce/allinone/phones");
	linkSet.add("http://webscraper.io/contact");
	request(firstURL, function(error, response, body) {
	   if(error) {
		 console.log("Error: " + error);
	   }
	   // Check status code (200 is HTTP OK)
	   if(response.statusCode === 200) {
		 // Parse the document body
		 var body = cheerio.load(body);
		 var relativeLinks = body("a"); //looks for links, check if correct later to check both relative and absolute urls
		 relativeLinks.each(function() {
			if((body(this).attr('href').charAt(0) === "/") || (body(this).attr('href').startsWith(baseURL))) //check if link starts with '/' (relative link) or is absolute link of same domain
			{
				var str = baseURL + body(this).attr('href');
				if(!currSet.has(str))
				{
					currSet.add(str);
					nextPages.push(str);
				}
			}
		 });
	   }
	   else
	   {
		   console.log("status code not 200");
	   }
	   //console.log(numCorr +" "+ linkSet.size);
	   if(currSet.size == linkSet.size) //we know we added pages to set, now check if we can traverse one of them
	   {
		   console.log("addsNewPages Passed");
		   traversesNextPages(nextPages);
	   }
	   else
		   console.log("addsNewPages Failed");
	});
}

function traversesNextPages(nextPages) //checks if new pages added can be traversed / exist
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

function cssTest() //checking if all css assets grabbed
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

function scriptTest() // checking if all static scripts grabbed
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

function imgTest() //checking if all imgs grabbed
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

