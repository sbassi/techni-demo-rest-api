module.exports = function(){
  var express = require('express');
  var app = express();
  var mongoskin = require('mongoskin');

app.get('/api/status/', function(req, res, next) {
  var status = {"webserver":'UP',"DB":'DOWN',"uptime":null};

  // Test DB
  var db = mongoskin.db('mongodb://@localhost:27017/techdb', {safe:true});
  var tokens = db.collection('tokens');
  tokens.findOne({}, function(err, result) {
    if (!err){
      status['DB'] = 'UP';
    }
    res.send(status);
  })
  // TEST UPTIME
  var execSync = require("exec-sync");
  var upTime = execSync("uptime");
  status['uptime'] = upTime;
  // Note: webserver results are mocked
})

  return app;
}();