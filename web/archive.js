/* global __dirname, require, exports */
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');

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

var scrapeData = function(url, callback, secure){
  console.log('start scraping', url, typeof url);

  var newUrl = secure ? 'http://'+url : 'https://'+url;
  var module = secure ? http : https;
  var req = module.get(newUrl, function(res) {
    var message = '';
    res.on('data', function (chunk) {
      message += chunk;
      console.log(chunk);
    });
    res.on('end', function(){
      //write to site list

      fs.appendFile(paths.list, '\n'+url, function(){});
      callback(message);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    if(!secure){
      scrapeData(url, callback, true);
    }
  });
};

exports.loadFile = function(url, callback){
  var filePath = paths.archivedSites + '/' + url;
  console.log('loading', url);
  fs.exists(filePath, function(exists){
    if (!exists) {
      console.log('does not exists in list', url);
      //write to
      scrapeData(url, function(content){
        fs.writeFile(filePath, content, function(){
          readFile(filePath, callback);
        });
      });
    } else {
      //either exists or newly made
      console.log('existing file', url);
      readFile(filePath, callback);
    }
  });
};
