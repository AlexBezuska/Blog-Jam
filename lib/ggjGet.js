/*
author: Alex Bezuska abezuska@gmail.com http://alexbezuska.com/
license: MIT
Functions for scraping page data from globalgamejam.org game jam entries
Cheerio required - https://github.com/cheeriojs/cheerio
all fucntions assume they are being passed `cheerio.load(body)` as `$`
where `body` is the html of the reuested web page
*/
module.exports =  {
  title : function ($) {
    return $(".l-content").find("h1").first().text();
  },
  featuredImage : function ($) {
    return $(".views-field-field-game-featured-image img").attr("srcset");
  },
  authors: function($) {
    var array = [];
    var authorNames = $(".team-members .username");
    var authorNamesArray = [];
    authorNames.each(function( index ) {
      authorNamesArray.push( $(this).text() );
    });

    var authorLinks = $(".team-members .username");
    var authorLinksArray = [];
    authorLinks.each(function( index ) {
      authorLinksArray.push( $(this).attr("href") );
    });

    var authorImgs = $(".team-members img");
    var authorImgsArray = [];
    authorImgs.each(function( index ) {
      authorImgsArray.push( $(this).attr("srcset") );
    });

    if(authorNamesArray){
      for (var i = 0; i < authorNamesArray.length; i++){
        array.push( {
          name : authorNamesArray[i],
          link : "https://globalgamejam.org/"+ authorLinksArray[i],
          img : authorImgsArray[i]
        });
      }
    }
    return array;
  },
  screenshots: function($) {
    var imgs = $(".field--type-image img");
    var imgArray = [];
    imgs.each(function( index ) {
      imgArray.push({
        full : $(this).attr("srcset"),
        thumb : $(this).attr("srcset")
      }
       );
    });
    return imgArray;
  },
  description: function($){
    var description = $(".field--name-field-game-about .field__items .field__item").text();
    return description;
  }

}
