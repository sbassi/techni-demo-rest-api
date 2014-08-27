module.exports = function(){
  var express = require('express');
  var app = express();

  app.get('/', function(req, res, next) {
    res.send('please use the API according to the documentation')
  })

  return app;
}();