var config = require("./config.json");

/* Application */
var fs = require("fs");
var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var handlebars = require("handlebars");

var supportedJams = [
  "ludumdare.com",
  "globalgamejam.org",
  "itch.io/jam"
];
var ldGet = require("./lib/ldGet.js");
var itchGet = require("./lib/itchGet.js");
var ggjGet = require("./lib/ggjGet.js");

var totalEntriesCompo = undefined;
var totalEntriesJam = undefined;

requestJamMetadata (config, requestGamePages, requestGamePage, generateOutputFile);

function requestJamMetadata (config, requestGamePages, requestGamePage, generateOutputFile) {
// ludumdare.com
  if (config.jamUrl.indexOf("ludumdare.com") > -1){
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
    console.log("jam type not supported yet, or jamUrl not set in config");
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
      niceTerminalOutput(i, config.urls, jamType);
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
    jam = ldNewGet;
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
  game.author = jam.author($);
  game.authorLink = jam.authorLink($);
  game.screenshots = jam.screenshots($);
  if(jamType === "ludumdare.com") {
    game.description = jam.description($);
    game.type = jam.type($);
    game.ratings = jam.ratings($, totalEntriesJam, totalEntriesCompo);
    game.comments = jam.commentCount($);
  }
  if(jamType === "itch.io/jam"){
    game.cover = jam.cover($);
    game.submissionTime = jam.submissionTime($);
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
    return contains(url, thing);
  }).indexOf(true)];
}

function contains(string, thingToFind){
  return string.indexOf(thingToFind) > -1;
}

function msgForType (type) {
  if (type === "ludumdare.com"){
    return "\"This is a ludumdare.com system, I know this.\" - Lex Murphy";
  } else if (type === "globalgamejam.org"){
    return "\"This is a globalgamejam.org system, I know this.\" - Lex Murphy";
  } else if (type === "itch.io/jam"){
    return "\"This is a itch.io/jam system, I know this.\" - Lex Murphy";
  } else{
    return "URL not recognized by Community Game Jam Blogpost Generator...";
  }
}

function niceTerminalOutput(i, configUrls, jamType){
  console.log("\n -- processing", (i + 1) + "/" + configUrls.length, "-- \n", configUrls[i], "\n", msgForType(jamType));
}