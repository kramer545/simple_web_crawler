# simple_web_crawler

Instructions are for Windows

Install:
  1. Download and install Node.js, which includes npm if not already installed, download link: "https://nodejs.org/en/download/".
  2. Program was written for Node.js v6.11.4 and npm v5.5.1, check you versions by opening the command prompt and typing "node --version" and "npm --version", if your versions are behind this, download Node.js from the above link for Node.js and for npm, update npm with the command "npm install npm" in the command prompt.
  3. Program uses three libraries: url-parse, request and cheerio, download and install them by typing the following commands into the command prompt "npm install url-parse", "npm install request", "npm install cheerio".
  
Use/Run Program
  1. Change the directory in the command prompt with the command "cd 'x'" where x is the path to the folder where the program is, for example mine is "cd documents/web_crawler". Alternatively open the folder containing the program, click the top buildpath bar (not the search bar) and type in "cmd", this will open the command prompt at the current folder.
  2. Finally to run the program type "node crawler.js" in the command prompt to run the program with the default url, or "node crawler.js 'x'" where x is the url you want to use instead, for example "node crawler.js http://webscraper.io/test-sites/e-commerce/allinone".
  3. If you would like to run the unit tests for the program, type instead "node testCrawler.js" and it will list the results of each test, you cannot pass a url to this.
  4. Since the program runs until it visits every page it can, it might continue for a long time, to cancel the program early,hit ctrl and the c key at the same time in the command prompt while it is running.
