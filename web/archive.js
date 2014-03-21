/* global __dirname, require, exports */
var _ = require('underscore');
var path = require('path');
var http = require('http');
var https = require('https');
var mysql = require('mysql');
var zlib = require('zlib');
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
var nodeCryptojs = require('node-cryptojs-aes');
var passPhrase = '4j9h8trhg84tj9034uhf78h34fhg7'.toString("base64");
// node-cryptojs-aes main object;
var CryptoJS = nodeCryptojs.CryptoJS;
// custom json serialization format
var JsonFormatter = nodeCryptojs.JsonFormatter;
// message to cipher
//


var encrypt = function(message){
  var encrypted = CryptoJS.AES.encrypt(message, passPhrase, { format: JsonFormatter });
  // convert CipherParams object to json string for transmission
  return encrypted.toString();
};

var decrypt = function(message){
  var decrypted = CryptoJS.AES.decrypt(message, passPhrase, { format: JsonFormatter });
  // convert to Utf8 format unmasked data
  return CryptoJS.enc.Utf8.stringify(decrypted);
};
//=========================================================
// //
// .pipe(zlib.createDeflate()).pipe(response);
//   } else if (acceptEncoding.match(/\bgzip\b/)) {
//     response.writeHead(200, { 'content-encoding': 'gzip' });
//     raw.pipe(zlib.createGzip()).pipe(response);
//   } else

exports.urlList = function(callback){
  var query = 'SELECT url from web_historian.websites';
  connection.query(query, function(err, rows) {
    callback(_.pluck(rows, 'url'));
  });
};

var readFile = function(url, callback){
  var query = 'SELECT * from web_historian.websites where url="'+url+'"';
  connection.query(query, function(err, rows) {
    if (err){
      throw err;
    } else if (rows.length === 0) {
      //not found
      callback();
    } else {
      callback(rows[0].html);
    }
  });
};

var updateHtml = function(url, html){
  // Converts buffer to binary string
    // Converts binary string to buffer
  html = encrypt(html);//binaryString.toBuffer(html);
  console.log(html);
  var query = 'UPDATE web_historian.websites SET html="'+html+'" where url="'+url+'"';
  console.log(query);
  connection.query(query, function(err) {
    if (err) throw err;
    //TODO
    //console.log('updateHtml');
    //callback('text/html', rows[0].html.toString());
  });
};

var addUrl = function(url){
  //update exports.loadFile to use this
  connection.query('INSERT INTO web_historian.websites (url) values("' + url +'")', function(err, rows) {
    if (err) throw err;
    //console.log('addUrl');
    //callback();
  });
};

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
      updateHtml(url, message);
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
  readFile(url, function(data){
    if (!data) {
      addUrl(url);
      callback();
    } else {
      console.log('existing file', url);
      callback('text/html', data);
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
