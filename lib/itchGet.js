/*
author: Alex Bezuska abezuska@gmail.com http://alexbezuska.com/
license: MIT
Functions for scraping page data from itch.io game jam entries
Cheerio required - https://github.com/cheeriojs/cheerio
all fucntions assume they are being passed `cheerio.load(body)` as `$`
where `body` is the html of the reuested web page
*/
module.exports = {

  entries : function ($){
    return $("[data-label='jam_entries'] .stat_value").first().text();
  },

  title : function ($) {
    return $(".jam_game_header h1").first().text().replace("View game page »", "");
  },

  author : function ($) {
    return $(".game_author a").first().text();
  },

  authorLink : function ($) {
    return $(".game_author a").first().attr("href");
  },

  submissionTime : function ($) {
    return $(".game_author").first().text().split("with")[1];
  },

  // description : function ($) {
  //   return replaceAll($(".shot-nav").next("p").text(), "\r", "</br>");
  // },
  //
  // commentCount : function ($) {
  //   return $(".comment").length;
  // },

  cover : function ($) {
    return $(".game_cover").attr("src");
  },
    
  screenshots : function ($) {
    var array = [];
    var imgLink = $(".game_screenshots a");
    if(imgLink){
      imgLink.each( function () {
        array.push({
          full : $(this).attr("href"),
          thumb : $(this).children("img").attr("src")
        });
      });}
      return array;
    },

    // ratings : function ($, totalEntriesJam, totalEntriesCompo) {
    //   var total = {
    //     jam: totalEntriesJam,
    //     compo: totalEntriesCompo
    //   }
    //   var ratings = [];
    //   addCategory($, ratings, "Coolness", total);
    //   addCategory($, ratings, "Fun", total);
    //   addCategory($, ratings, "Audio", total);
    //   addCategory($, ratings, "Overall", total);
    //   addCategory($, ratings, "Mood", total);
    //   addCategory($, ratings, "Innovation", total);
    //   addCategory($, ratings, "Graphics", total);
    //   addCategory($, ratings, "Humor", total);
    //   addCategory($, ratings, "Theme", total);
    //   return ratings;
    // }

  }

