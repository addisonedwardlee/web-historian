var archive = require('./archive.js');
var fs = require('fs');

fs.readFile(archive.paths.list, function(err, data){
  if(err) throw err;
  var sitesArray = data.toString().split('\n');
  sitesArray.forEach(function(site){
    archive.scrapeData(site, function(){});
  });
});
