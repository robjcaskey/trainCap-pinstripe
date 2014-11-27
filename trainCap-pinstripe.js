var express = require('express')
var app = express()
app.get('/', function(rq, res) {
  res.render('trainControls.jade', { layout: false });
});
var server = app.listen(8080, function() {
});
