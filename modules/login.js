module.exports = function(){
  var express = require('express');
  var app = express();
  var mongoskin = require('mongoskin');
  var sha256 = require('sha256');

  var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

  var db = mongoskin.db('mongodb://@localhost:27017/techdb', {safe:true})

app.post('/api/login/', function(req, res, next) {
  var user = req.body['user'];
  var login = db.collection('login');
  login.findOne(function(err, result) {
    if (err) throw err;
    var salt = result['salt'];
    var password_hash = sha256(req.body['password']+salt);
    if (user==result['user'] && password_hash==result['hashed_salted_pass'] ){
      var token = guid();
      console.log('Auth granted. Token ' + token);
      var tokens = db.collection('tokens');
      tokens.insert({"token": token}, function(err, result) {
        if (err) throw err;
          if (result) console.log('Token added to DB');
        });
      res.send(token);
    }
    else{
      console.log('Auth denied!');
      res.statusCode = 403;
      res.send('403 error');
    }
  });
})


  return app;
}();