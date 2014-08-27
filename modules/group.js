module.exports = function(){
  var express = require('express');
  var app = express();
  var mongoskin = require('mongoskin');

  var db = mongoskin.db('mongodb://@localhost:27017/techdb', {safe:true})


app.get('/api/customers/:group_by/', function(req, res, next) {

  var token = req.headers['x-token'];
  var tokens = db.collection('tokens');
  
  tokens.findOne({"token":token}, function(err, result) {
    if (err) throw err;
    if (token==result['token']){
      console.log('authorized');

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


  return app;
}();