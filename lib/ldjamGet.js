/*
author: Alex Bezuska abezuska@gmail.com http://alexbezuska.com/
license: MIT
Functions for scraping page data from ludumdare.com game jam entries
Cheerio required - https://github.com/cheeriojs/cheerio
all fucntions assume they are being passed `cheerio.load(body)` as `$`
where `body` is the html of the reuested web page
*/
module.exports = {

  entries : function ($, type){
    var text;
    if (type == "Jam"){
      text = $(".section.-submissions .-legend ul li:nth-child(1) p").text();
      text = text.split("(")[1];
      text = text.split(" ")[0];
    }else {
        text = $(".section.-submissions .-legend ul li:nth-child(2) p").text();
        text = text.split("(")[1];
        text = text.split(" ")[0];
    }
    return text;
  },
  title : function ($) {
    return $(".-title a").first().text();
  },

  authors : function ($) {

    var array = [];
    var authorNames = $(".-by .-name");
    var authorNamesArray = [];
    authorNames.each(function( index ) {
      authorNamesArray.push( $(this).text() );
    });

    var authorLinks = $(".-by .-at-name");

    var authorLinksArray = [];
    authorLinks.each(function( index ) {
      authorLinksArray.push( $(this).attr("href") );
    });
    if(authorNamesArray){
      for (var i = 0; i < authorNamesArray.length; i++){
        array.push( {
          name : authorNamesArray[i],
          link : "http://ldjam.com/"+ authorLinksArray[i]
        });
      }
    }
    return array;
  },

  authorLink : function ($) {
    return "http://ldjam.com/"+ $(".-by .-at-name").first().attr("href");
  },

  type : function ($) {
    return getJamType($);
  },

  description : function ($) {
    return $(".-block-if-not-minimized").text();
  },

  commentCount : function ($) {
    return $(".-comment").length;
  },

  screenshots : function ($) {
    var array = [];
    var screenshots = $(".-block-if-not-minimized img");
    if(screenshots){
      screenshots.each(function( index ) {
        array.push( {
          full : "http://" + $(this).attr("src").split("//")[1],
          thumb : "http://" + $(this).attr("src").split("//")[1]
        });
      });
    }
      return array;
    },

    ratings : function ($, totalEntriesJam, totalEntriesCompo) {
      console.log("TEST", totalEntriesJam, totalEntriesCompo);
      var total = {
        jam: totalEntriesJam,
        compo: totalEntriesCompo
      }
      var ratings = [];
      addCategory($, ratings, "Coolness", total);
      addCategory($, ratings, "Fun", total);
      addCategory($, ratings, "Audio", total);
      addCategory($, ratings, "Overall", total);
      addCategory($, ratings, "Mood", total);
      addCategory($, ratings, "Innovation", total);
      addCategory($, ratings, "Graphics", total);
      addCategory($, ratings, "Humor", total);
      addCategory($, ratings, "Theme", total);
      console.log(ratings);
      return ratings;
    }

  }

  function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  function getScore($, type){
    var score = $(".-grade .-title:contains("+ type +")").next("strong").text();
    console.log(score);
    if (type.indexOf("Coolness") === 0 && score){
      if (score){
        if (score.indexOf("gold") > -1){
          return "over 100 games rated ";
        } else if (score.indexOf("silver") > -1){
          return "over 50 games rated ";
        } else if (score.indexOf("bronze") > -1){
          return "over 25 games rated ";
        } else {
          return score.replace("#","");
        }
      }
    } else if (score){
      if (score.indexOf("gold") > -1){
        return 1;
      } else if (score.indexOf("silver") > -1){
        return 2;
      } else if (score.indexOf("bronze") > -1){
        return 3;
      } else {
        return score.replace("#","");
      }
    }
  }

  function getPercent(number, total){
    if (!number || isNaN(number) || !total || isNaN(total) ){
      return 0;
    }
    var per = ((1 - (number / total)) * 100).toFixed(2);
    if (per){
      return per;
    }
  }

  function percentColor (percent){
    if (percent >= 80){
      return "green";
    }else{
      return "blue";
    }
  }

  function addCategory($, ratings, category, total){
    var obj = {};
    obj.type = category;
    var totalEntries;
    if(category.indexOf("Coolness") !== 0){
      // no bar for coolness, coolness is weird
      obj.bar = true;
      if (getJamType($) == "compo"){
        obj.total = total.compo
      }else{
        obj.total = total.jam;
      }
    }else{
      // coolness is out of all entries, coolness is weird
      obj.total = parseFloat(total.jam) + parseFloat(total.compo);
    }
    obj.score = getScore($, category, obj.total);
    obj.percent = getPercent(obj.score, obj.total);
    obj.color = percentColor(obj.percent);
    ratings.push(obj);
  }



function getJamType($){
  var type = $(".-by span:nth-child(1)").first().text();
   return type.split(" ")[0].toLowerCase();
}
