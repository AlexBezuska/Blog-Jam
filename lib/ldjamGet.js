/*
author: Alex Bezuska abezuska@gmail.com http://alexbezuska.com/
license: MIT
Functions for scraping page data from ludumdare.com game jam entries
Cheerio required - https://github.com/cheeriojs/cheerio
all fucntions assume they are being passed `cheerio.load(body)` as `$`
where `body` is the html of the reuested web page
*/
module.exports = {

  submissions : function ($){
    var something = $("title").first().text();
    //$("body>div:eq(0)>div:eq(1)>div:eq(1)>div:eq(0)>div>div:eq(1)>div:eq(0)>div:eq(1)>div:eq(1)>div:eq(0)>span:eq(1)").first().text();
    console.log("yo",something);
    // var submissions = $(".section.-submissions .-value.-title").text();
    return test;
  },

  // jamTotal : function ($){
  //   var submissions = $(".section.-submissions .-value.-title").text();
  //   return submissions;
  // },
  //
  // compoTotal : function ($){
  //   var submissions = $(".section.-submissions .-value.-title").text();
  //   return submissions;
  // },

  title : function ($) {
    return $("h2").first().text();
  },

  author : function ($) {
    return $("a[href*='author/']").first().text();
  },

  authorLink : function ($) {
    return "http://ludumdare.com/compo/compo/" + $("a[href*='author/']").first().attr("href");
  },

  type : function ($) {
    return $("a[href*='author/']").first().next("i").text();
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
    },

    ratings : function ($, totalEntriesJam, totalEntriesCompo) {
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
      return ratings;
    }

  }

  function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  function getScore($, type){
    var td = $("td:contains("+ type +")").prev("td").html();
    if (type.indexOf("Coolness") === 0 && td){
      if (td){
        if (td.indexOf("gold") > -1){
          return "over 100 games rated ";
        } else if (td.indexOf("silver") > -1){
          return "over 50 games rated ";
        } else if (td.indexOf("bronze") > -1){
          return "over 25 games rated ";
        } else {
          return td.replace("#","");
        }
      }
    } else if (td){
      if (td.indexOf("gold") > -1){
        return 1;
      } else if (td.indexOf("silver") > -1){
        return 2;
      } else if (td.indexOf("bronze") > -1){
        return 3;
      } else {
        return td.replace("#","");
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
      if ($("a[href*='author/']").first().next("i").text().indexOf("Compo") > -1){
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
