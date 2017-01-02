var config = {
  /*
    urls - currently this program only woths with ludumdare.com game pages
  */
  urls : [
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=34387",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=35711",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=40673",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=57618",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=58120",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=58187",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=63943",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=64869",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=8310",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=90468",
    "http://ludumdare.com/compo/ludum-dare-37/?action=preview&uid=92205"
  ],
  /*
    ordering options
    "default" - games will be presented in order of the urls in the array
    "alpha" - games will be in alphabetical order by title
  */
  ordering : "alpha",
  template : "./templates/ludumdare-bootstrap.html",
  outputFile : "./output/blog-post.html"
};


/* Application */

var fs = require("fs");
var request = require("request");
var cheerio = require("cheerio");
var handlebars = require("handlebars");

var json = [];
var requests = 0;
for (var i = 0; i < config.urls.length; i++) {
  var currentUrl = config.urls[i];
  (function(i){
    request(currentUrl,
      function(err, res, body){

        if(!err){
          requests++;
          var $ = cheerio.load(body);
          var game = {
            url: config.urls[i],
            title : ldGet.title($),
            type : ldGet.type($),
            author : ldGet.author($),
            description : ldGet.description($),
            comments: ldGet.commentCount($),
            screenshots: ldGet.screenshots($)
          };
          console.log(game.url);
          json.push(game);
          requests--;
          if (requests === 0){
            if (config.ordering === "alpha"){
              json = sortArrayObjects(json, "title");
            }
            fs.writeFile(config.outputFile, renderFromExternalTemplate(config.template, json), function(err) {
              if(err) {
                return console.log(err);
              }
            });
          }
        }
      });
    })(i);
  }

  function renderFromExternalTemplate(templateFile, json){
    var file = fs.readFileSync(templateFile, "utf8");
    var template = handlebars.compile(file);
    return template(json);
  }

  function sortArrayObjects(array, objProp){
    return array.sort(function(a, b){
      if(a[objProp] < b[objProp]) return -1;
      if(a[objProp] > b[objProp]) return 1;
      return 0;
    });
  }

  function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }


/*
  Functions that handle the cheerio(jquery) selectors for grabbing various
  content from ludumdare.com game pages
  Needs to be seperated into new library
*/
  var ldGet = {
    title : function ($) {
      return $("#compo-body").find("h2").first().text();
    },
    author : function ($) {
      return $("#compo-body").find("a[href*='author/']").first().text();
    },
    type : function ($) {
      return $("#compo-body").find("a[href*='author/']").first().next("i").text();
    },
    description : function ($) {
      return replaceAll($(".shot-nav").next("p").text(), "\r", "</br>");
    },
    commentCount : function ($) {
      return $(".comment").length;
    },
    screenshots : function ($) {
      var array = [];
      var snimg = $(".sn-img");
      if(snimg){
        snimg.each(function( index ) {
          array.push( {
            full : $(this).attr("src").replace("-crop-180-140.jpg", ""),
            thumb : $(this).attr("src")
          });
        });}
        return array;
      }
    };

