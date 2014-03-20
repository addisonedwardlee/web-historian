/* global __dirname, require, exports */
var publicFiles = require('./publicFiles.js');
var path = require('path');
var archive = require('./archive.js');
//responders ==============================================
//respond with content of a file, either static or archived
var respondFile= function(res, contentType, content){
  res.writeHead(200, {'Content-Type': contentType});
  res.end(content);
};

//servers =================================================
var paths = {
  'siteAssets' : path.join(__dirname, '/public')
};
//home url, ask static module to respond with index.html
var serveHome = function(req, res){
  publicFiles.loadFile(paths.siteAssets + '/index.html', function(contentType, content){
    respondFile(res, contentType, content);
  });
};

//determine the file type and path
//and ask static module to respond with the file
var serveAsset = function(req, res, urlTokens){
  publicFiles.loadFile(paths.siteAssets + '/' + urlTokens[1], function(contentType, content){
    respondFile(res, contentType, content);
  });
};

//GET request with external url
//ask the archive module to repond with archived html
var getArchive = function(req, res, urlTokens){
  archive.loadFile(urlTokens[0], function(contentType, content){
    respondFile(res, contentType, content);
  });
};

//POST request having external url in body
//ask the archive module to repond with archived html
var postArchive = function(req, res){
  var message = '';
  req.on('data', function(chunk){
    message += chunk;
    console.log('in dataChunk');
  });
  req.on('end', function(){
    archive.loadFile(message.slice(4), function(contentType, content){
      respondFile(res, contentType, content);
    });
  });
};

//routing =================================================
var routeMap = {
  'GET': {
    '': serveHome,
    'js': serveAsset,
    'css': serveAsset,
    'favicon.ico': function(){},
    '*': getArchive,
  },
  'POST': {
    '': postArchive
  }
};


var tokenizeUrl = function(url){
  return url.split('/').slice(1);
};

var router = function(method, urlTokens){
  var currentMap = routeMap[method];
  return currentMap[urlTokens[0]] || currentMap['*'];
};

//=========================================================
exports.handleRequest = function (req, res) {
  console.log('new ', req.method, req.url);
  var urlTokens = tokenizeUrl(req.url);
  router(req.method, urlTokens)(req, res, urlTokens);
};
