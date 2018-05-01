var config = require("./config.json");

/* Application */
var puppeteer = require('puppeteer');
var fs = require('fs');
var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var handlebars = require("handlebars");
var checklist = {};

var supportedJams = [
  "ldjam.com",
  "ludumdare.com",
  "globalgamejam.org",
  "itch.io/jam"
];
var ldGet = require("./lib/ldGet.js");
var ldjamGet = require("./lib/ldjamGet.js");
var itchGet = require("./lib/itchGet.js");
var ggjGet = require("./lib/ggjGet.js");

var messages = {
  jamFail : "jam type not supported yet, or jamUrl not set in config",
  urlFail : "\nERROR: \"{{url}}\" is not recognized as a valid jam game url...\n",
  urlSuccess : "\"This is a {{jamType}} system, I know this.\" - Lex Murphy"
};

var totalEntriesCompo = undefined;
var totalEntriesJam = undefined;

requestJamMetadata (config, requestGamePages, requestGamePage, generateOutputFile);

function requestJamMetadata (config, requestGamePages, requestGamePage, generateOutputFile) {

  // ldjam.com
  if (config.jamUrl.indexOf("ldjam.com") > -1){
    var games = [];
    getPageHTML(config.jamUrl, "./temp/jampage.html", function(){
      var htmlString = fs.readFileSync("./temp/jampage.html");
      totalEntriesJam = ldjamGet.entries(cheerio.load(htmlString), "Jam");
      console.log("Jam entries", totalEntriesJam);

      totalEntriesCompo = ldjamGet.entries(cheerio.load(htmlString), "Compo");
      console.log("Compo entries", totalEntriesCompo);

      for (var i = 0; i < config.urls.length; i++){
        getPageHTML(config.urls[i], "./temp/"+ i +".html", function(){
          for (var i = 0; i < config.urls.length; i++){
            var body = fs.readFileSync("./temp/"+ i +".html");
            games.push(buildJamGame("ldjam.com", config, i, body));
            if (games.length == config.urls.length){
              generateOutputFile(games, config);
            }
          }
        });
      }
    });

  }

  // ludumdare.com
  else if (config.jamUrl.indexOf("ludumdare.com") > -1){
    rp(config.jamUrl + "/?action=preview&etype=open")
    .then( function (htmlString) {
      totalEntriesJam = ldGet.entries(cheerio.load(htmlString), "Jam");
      console.log("Jam entries", totalEntriesJam);
      return rp(config.jamUrl + "/?action=preview&etype=compo")
    })
    .then( function (htmlString) {
      totalEntriesCompo = ldGet.entries(cheerio.load(htmlString), "Compo");
      console.log("Compo entries", totalEntriesCompo);
    }).then( function () {
      requestGamePages(config, requestGamePage, generateOutputFile);
    })
    .catch(err => console.log);
  }

  // Global Game Jam
  else if (config.jamUrl.indexOf("globalgamejam.org") > -1){
    requestGamePages(config, requestGamePage, generateOutputFile);
  }

  // itch.io/jam
  else if (config.jamUrl.indexOf("itch.io/jam/") > -1){
    rp(config.jamUrl)
    .then( function (htmlString) {
      totalEntriesJam = itchGet.entries(cheerio.load(htmlString));
      console.log("Jam entries: ", totalEntriesJam);
    })
    .then( function () {
      requestGamePages(config, requestGamePage, generateOutputFile);
    })
    .catch(err => console.log);
  }

  // bad url
  else {
    console.log(messages.jamFail);
  }
}

function requestGamePages(config, requestGamePage, generateOutputFile){
  var promises = [];
  for (var i = 0; i < config.urls.length; i++) {
    promises.push( requestGamePage(config, i, config.urls[i], generateOutputFile) );
  }
  return Promise.all(promises).then((games) => {
    generateOutputFile(games, config);
  });
}

function requestGamePage(config, i, currentUrl) {
  return new Promise( function(resolve, reject) {
    request(currentUrl, function (error, response, body) {
      if(error) {
        console.log(error);
        resolve({title: "Something went wrong..."});
      }
      var jamType = whatJamIsThis(config.urls[i], supportedJams);
      niceTerminalOutput(i, config.urls, supportedJams);
      resolve( buildJamGame(jamType, config, i, body) );
    });
  });
}

function generateOutputFile(games, config){
  if (config.ordering === "alpha"){
    games = sortArrayObjects(games, "title");
  }

  fs.writeFile(config.outputFile, renderFromExternalTemplate(config.template, games), function(err) {
    if(err) { return console.log(err); }
    console.log("\n -- complete A++ would scrape again --\n");
  });
}

function buildJamGame(jamType, config, i, body){
  var $ = cheerio.load(body);
  var jam;
  switch (jamType) {
    case "ludumdare.com":
    jam = ldGet;
    break;
    case "ldjam.com":
    jam = ldjamGet;
    break;
    case "itch.io/jam":
    jam = itchGet;
    break;
    case "globalgamejam.org":
    jam = ggjGet;
    break;
  }
  var game = {};
  game.url = config.urls[i];
  game.title = jam.title($);
  game.authors = jam.authors($);
  game.screenshots = jam.screenshots($);
  game.description = jam.description($);

  if(jamType === "ludumdare.com" || jamType === "ldjam.com") {
    game.type = jam.type($);
    game.ratings = jam.ratings($, totalEntriesJam, totalEntriesCompo);
    game.comments = jam.commentCount($);
  }

  if(jamType === "itch.io/jam"){
    game.cover = jam.cover($);
    game.submissionTime = jam.submissionTime($);
  }

  if(jamType === "globalgamejam.org"){
    game.featuredImage = jam.featuredImage($);
  }
  return game;
}

function renderFromExternalTemplate(templateFile, games){
  var file = fs.readFileSync(templateFile, "utf8");
  var template = handlebars.compile(file);
  return template(games);
}

function sortArrayObjects(array, objProp){
  return array.sort(function(a, b){
    if(a[objProp] < b[objProp]) return -1;
    if(a[objProp] > b[objProp]) return 1;
    return 0;
  });
}

function whatJamIsThis (url, supportedJams) {
  return supportedJams[supportedJams.map(function (thing) {
    return contains(thing, url);
  }).indexOf(true)];
}

function contains(needle, haystack){
  return (haystack.indexOf(needle) > -1);
}

function msgForType (url, supportedJams) {
  var jamType = whatJamIsThis(url, supportedJams);
  if (contains(jamType, supportedJams)){
    return messages.urlSuccess.replace("{{jamType}}", jamType);
  } else {
    return messages.urlFail.replace("{{url}}", url);
  }
}

function niceTerminalOutput(i, configUrls, supportedJams){
  console.log("\n -- processing", (i + 1) + "/" + configUrls.length, "-- \n", configUrls[i], "\n", msgForType(configUrls[i], supportedJams));
}


function getPageHTML(url, fileName, callback){
  checklist[fileName] = false;
  (async() => {
    var browser = await puppeteer.launch({ headless: true });
    var page = await browser.newPage();
    await page.goto(url, {});

    await page.waitFor(3000);
    var html = await page.content();
    fs.writeFile(fileName, html, () => {
      console.log("saved", fileName);
      checklist[fileName] = true;
      if (checkListCheck(checklist)){
        if(!callback){
          console.log("okay, all done!");
        }else{
          callback();
        }
      }
    });
    browser.close();
  })();
}


function checkListCheck(list) {
  var result = true;
  Object.keys(list).forEach( function (key) {
    if (!list[key]){
      result = false;
    }
  });
  return result;
}
