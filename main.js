
var express = require('express')
  , mongoskin = require('mongoskin')
  , bodyParser = require('body-parser')
  , sha256 = require('sha256')
  , fs = require('fs');

var app = express()
app.use(bodyParser())

var db = mongoskin.db('mongodb://@localhost:27017/techdb', {safe:true})

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


app.get('/', function(req, res, next) {
  res.send('please select a collection, e.g., /collections/messages')
})

app.post('/api/customers/:sort_by/:order/:from?/:to?', function(req, res, next) {

  // check if logged in
  var token = req.body['token'];
  var tokens = db.collection('tokens');

  tokens.findOne({"token":token}, function(err, result) {
    if (err) throw err;
    console.log(result['token']);

    if (token==result['token']){
      // Authenticated
      function showCustomers(err, result) {
        if (err) throw err;
        for (i = 0; i < result.length; i++) { 
          delete result[i]["_id"];
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      }
      var order_d = {'A':1, 'D':-1};
      var customers = db.collection('customers');
      var sortBy = req.params.sort_by;
      var order = order_d[req.params.order];
      if (req.params.from && req.params.to) {
        var firstValue = parseInt(req.params.from);
        var lim = parseInt(req.params.to) - firstValue + 1;
        customers.find({},{sort:[[sortBy, order]]}).limit(lim).skip(firstValue).toArray(showCustomers);
      }
      else{
        customers.find({},{sort:[[sortBy, order]]}).toArray(showCustomers);
      }

    }
    else{
      res.statusCode = 403;
      res.send('403 error');
    }


  });

})


app.post('/api/customers/:group_by/', function(req, res, next) {

  var token = req.body['token'];
  var tokens = db.collection('tokens');

  tokens.findOne({"token":token}, function(err, result) {
    if (err) throw err;
    if (token==result['token']){
      console.log('auth');

      var customers = db.collection('customers');
      var groupBy = req.params.group_by;

      customers.group([groupBy], {}, {"count":0}, "function (obj, prev) { prev.count++; }", true, function(err, result) {

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result));
      });

    }
    else{
      res.statusCode = 403;
      res.send('403 error');      
    }
  })
})



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


app.get('/api/dir', function(req, res, next) {
  var path = req.query['path'];
  var x = fs.readdirSync(path)
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({'files':x}));
})


app.listen(8080)
