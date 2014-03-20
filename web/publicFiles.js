var mime = require('mime');
var fs = require('fs');

exports.loadFile = function(filePath, callback){
  fs.readFile(filePath, function(err, data){
    if(err) throw err;
    callback(mime.lookup(filePath), data);
  });
};
