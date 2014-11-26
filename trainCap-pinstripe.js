var express = require('express')
var app = express()
app.get('/', function(rq, res) {
  res.send("hello world!")
});
var server = app.listen(3000, function() {
});
