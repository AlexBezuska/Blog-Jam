module.exports =  {
  title : function ($) {
    return $(".l-content").find("h1").first().text();
  }
}
