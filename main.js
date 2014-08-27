
var express = require('express')
  , mongoskin = require('mongoskin')
  , bodyParser = require('body-parser')
  , sha256 = require('sha256')

var app = express()
app.use(bodyParser())

var db = mongoskin.db('mongodb://@localhost:27017/techdb', {safe:true})


app.get('/', require('./modules/root'));
app.post('/api/login/', require('./modules/login'));
app.get('/api/customers/:sort_by/:order/:from?/:to?', require('./modules/sort'));
app.get('/api/customers/:group_by/', require('./modules/group'));
app.get('/api/status/', require('./modules/status'));
app.get('/api/dir', require('./modules/dir'));

app.listen(8080)
