module.exports = function(){
  var express = require('express');
  var app = express();
  var mongoskin = require('mongoskin');

  var db = mongoskin.db('mongodb://@localhost:27017/techdb', {safe:true})


app.get('/api/customers/:sort_by/:order/:from?/:to?', function(req, res, next) {

  // check if logged in
  var token = req.headers['x-token'];
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


  return app;
}();