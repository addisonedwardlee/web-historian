/* global require */
var archive = require('./archive.js');

archive.urlList(function(data){
  data.forEach(function(url){
    archive.scrapeData(url);
  });
});
