var express = require('express')
var app = express()
app.set('view engine', 'jade')
app.use('/bower_components', express.static(__dirname + '/bower_components')); 
app.use('/js', express.static(__dirname + '/js')); 
app.use('/trainControlImages', express.static(__dirname + '/trainControlImages')); 
app.get('/', function(req, res) {
  res.render('trainControls.jade', { layout: false });
});
app.listen(8080)
