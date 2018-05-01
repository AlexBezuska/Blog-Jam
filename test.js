var puppeteer = require('puppeteer');
var fs = require('fs');

var config = require("./config.json");

function getPageHTML(url, fileName){
  (async() => {
    var browser = await puppeteer.launch({ headless: true });
    var page = await browser.newPage();
    await page.goto(url, {});
    await page.waitFor(3000);
    var html = await page.content();
    fs.writeFile(fileName, html, () => {
      console.log("saved", fileName);
    });
    browser.close();
  })();
}

getPageHTML(config.jamUrl, "./temp/jampage.html");

for (var i = 0; i < config.urls.length; i++){
  getPageHTML(config.urls[i], "./temp/"+ i +".html");
}
