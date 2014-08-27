module.exports = function(){
  var express = require('express');
  var app = express();
  var fs = require('fs');

app.get('/api/dir', function(req, res, next) {
  var path = req.query['path'];
  var x = fs.readdirSync(path)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({'files':x}));
})

  return app;
}();