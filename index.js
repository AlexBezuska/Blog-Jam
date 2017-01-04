var config = require("./config.json");

/* Application */
var fs = require("fs");
var request = require("request");
var rp = require('request-promise');
var cheerio = require("cheerio");
var handlebars = require("handlebars");

var ldGet = require("./lib/ldGet.js");
var ggjGet = require("./lib/ggjGet.js");

var totalEntriesCompo = undefined;
var totalEntriesJam = undefined;

requestJamMetadata (config, requestGamePages, requestGamePage, generateOutputFile);

function requestJamMetadata (config, getGamePages, getGamePage, generateHtml) {
  if (config.jamUrl.indexOf("ludumdare.com")){
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
      getGamePages(config, getGamePage, generateHtml);
    })
    .catch(err => console.log);
  } else {
    console.log("jam type not supported yet, or jamUrl not set in config");
  }
}

function requestGamePages(config, getGamePage, generateHtml){
  var promises = [];
  for (var i = 0; i < config.urls.length; i++) {
    promises.push( getGamePage(config, i, config.urls[i], generateHtml) );
  }
  return Promise.all(promises).then((games) => {
    generateHtml(games, config);
  });
}

function requestGamePage(config, i, currentUrl) {
  return new Promise( function(resolve, reject) {
    request(currentUrl, function (error, response, body) {
      if(error) {
        console.log(error);
        resolve({title: "Something went wrong..."});
      }
      var jamType = whatJamIsThis(config.urls[i]);
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
    case "globalgamejam.org":
    jam = ggjGet;
    break;
  }
  var game = {};
  game.url = config.urls[i];
  game.title = jam.title($);
  game.author = jam.author($);
  game.authorLink = jam.authorLink($);
  game.description = jam.description($);
  game.screenshots = jam.screenshots($);
  if(jamType === "ludumdare.com") {
    game.type = jam.type($);
    game.ratings = jam.ratings($, totalEntriesJam, totalEntriesCompo);
    game.comments = jam.commentCount($);
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

function whatJamIsThis (url) {
  if (url.indexOf("ludumdare.com") > -1){
    return "ludumdare.com";
  } else if (url.indexOf("globalgamejam.org") > -1){
    return "globalgamejam.org";
  } else{
    return "INVALID URL";
  }
}

function msgForType (type) {
  if (type === "ludumdare.com"){
    return "\"This is a ludumdare.com system, I know this.\" - Lex Murphy";
  } else if (type === "globalgamejam.org"){
    return "\"This is a globalgamejam.org system, I know this.\" - Lex Murphy";
  } else{
    return "URL not recognized by Community Game Jam Blogpost Generator...";
  }
}

function niceTerminalOutput(i, configUrls, jamType){
  console.log("\n -- processing", (i + 1) + "/" + configUrls.length, "-- \n", configUrls[i], "\n", msgForType(jamType));
}