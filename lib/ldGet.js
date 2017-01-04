module.exports = {

  entries : function ($, type){
    var h2 = $("h2:contains("+ type +" Entries)").first().text();
    return h2.match(/\(([^)]+)\)/)[1];
  },

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
    function replaceAll(str, find, replace) {
      return str.replace(new RegExp(find, 'g'), replace);
    }
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

      function getScore(type){
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
        //console.log(number, "is", per, "percent of", total);
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
  
      function addCategory(ratings, category){
        console.log(category);
        var obj = {};
        obj.type = category;

        if(category.indexOf("Coolness") !== 0){
          // no bar for coolness, coolness is weird
          obj.bar = true;
          if ($("a[href*='author/']").first().next("i").text().indexOf("Compo") > -1){
            totalEntries =  totalEntriesCompo;
          }else{
            totalEntries = totalEntriesJam;
          }


        }else{
          // coolness is out of all entries, coolness is weird
          totalEntries = parseFloat(totalEntriesJam) + parseFloat(totalEntriesCompo);
        }
        obj.score = getScore(category, totalEntries);

        obj.total = totalEntries;
        obj.percent = getPercent(obj.score, totalEntries);
        obj.color = percentColor(obj.percent);
        ratings.push(obj);
      }


      var ratings = [];
      addCategory(ratings, "Coolness");
      addCategory(ratings, "Fun");
      addCategory(ratings, "Audio");
      addCategory(ratings, "Overall");
      addCategory(ratings, "Mood");
      addCategory(ratings, "Innovation");
      addCategory(ratings, "Graphics");
      addCategory(ratings, "Humor");
      addCategory(ratings, "Theme");
      return ratings;
    }
  }