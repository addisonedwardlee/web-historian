/* global __dirname, require, exports */
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var http = require('http');

var paths = {
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

var readFile = function(filePath, callback){
  console.log('star reading from disk');
  fs.readFile(filePath, function(err, data){
    if(err) throw err;
    callback('text/html', data);
  });
};

var scrapeData = function(url, callback){
  console.log('start scraping');
  var options = {
    hostname: url,
    method: 'GET'
  };

  var req = http.request(options, function(res) {
    var message = '';
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.on('data', function (chunk) {
      message += chunk;
    });
    res.on('end', function(){
      console.log(message);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
};

exports.loadFile = function(url, callback){
  var filePath = paths.archivedSites + '/' + url;

  fs.exists(filePath, function(exists){
    if (!exists) {
      console.log('does not exists in list');
      //write to site list
      fs.appendFile(paths.list, url, function(){});
      //write to
      scrapeData(url, function(content){
        fs.writeFile(filePath, content, function(){
          readFile(filePath, callback);
        });
      });
    } else {
      //either exists or newly made
      readFile(filePath, callback);
    }
  });
};
