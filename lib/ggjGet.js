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
  }
}
