/* global __dirname, require, exports */
var mime = require('mime');
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'wh2',
  password: ''
});

connection.connect();

exports.paths = {
  'archivedSites' : path.join(__dirname, '../archives/sites'),
  'list' : path.join(__dirname, '../archives/sites.txt')
};

//=========================================================
var readFile = function(url, callback){
  connection.query('SELECT * from web_historian.websites where url="'+url+'"', function(err, rows) {
    if (err) throw err;
    callback('text/html', rows[0].html.toString());

    console.log(rows[0].url, rows[0].html.toString());
  });
};

var updateHtml = function(url, html, callback){
  connection.query('INSERT INTO web_historian.websites () where url="'+url+'"', function(err, rows) {
    if (err) throw err;
    callback('text/html', rows[0].html.toString());

    console.log(rows[0].url, rows[0].html.toString());
  });
};

var addUrl = function(url, callback){
  connection.query('INSERT INTO web_historian.websites (url) values("' + url +'")', function(err, rows) {
    if (err) throw err;
    callback('text/html', rows[0].html.toString());

    console.log(rows[0].url, rows[0].html.toString());
  });
}

//=========================================================

exports.scrapeData = function(url, callback, secure){
  console.log('start scraping', url, typeof url);

  var newUrl = secure ? 'http://'+url : 'https://'+url;
  var module = secure ? http : https;
  var req = module.get(newUrl, function(res) {
    var message = '';
    res.on('data', function (chunk) {
      message += chunk;
    });
    res.on('end', function(){
      //write to site list
      var filePath = exports.paths.archivedSites + '/' + url;
      fs.writeFile(filePath, message, function(){
        readFile(url, callback);
      });
      callback(message);
    });
  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
    if(!secure){
      exports.scrapeData(url, callback, true);
    }
  });
};

exports.loadFile = function(url, callback){
  var filePath = exports.paths.archivedSites + '/' + url;
  console.log('loading', url);
  fs.exists(filePath, function(exists){
    if (!exists) {
      console.log('does not exists in list', url);
      //write to
      exports.scrapeData(url, function(){
        fs.appendFile(exports.paths.list, '\n'+url, function(){});
      });
    } else {
      //either exists or newly made
      console.log('existing file', url);
      readFile(url, callback);
    }
  });
};




// Used with local file system instead of DB
// var readFile = function(filePath, callback){
//   console.log('star reading from disk');
//   fs.readFile(filePath, function(err, data){
//     if(err) throw err;
//     callback('text/html', data);
//   });
// };
