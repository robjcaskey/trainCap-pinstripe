var express = require('express')
var app = express()

var spawn = require('child_process').spawn
var python_process = spawn('/usr/bin/python',['-i'])
function sendPy(cmd) {
  python_process.stdin.write(cmd+"\n")
}
sendPy("import dccpi")
python_process.stdout.on('data', function(data) {
  console.log('stdout: '+data)
});
python_process.stderr.on('data', function(data) {
  console.log('stderr: '+data)
});
python_process.stderr.on('close', function(code) {
  console.log('close: '+code)
});

sendPy("e = DCCRPiEncoder(pin_a=8,pin_b=9,pin_break=7)")
sendPy("c = DCCController(e)")
sendPy("l1 = DCCLocomotive('DCC', 3)")
sendPy("c.register(l1)")
sendPy("c.start()")
setInterval(function() {
	sendPy("l1.speed(5)")
}, 100);

app.set('view engine', 'jade')
app.use('/bower_components', express.static(__dirname + '/bower_components')); 
app.use('/js', express.static(__dirname + '/js')); 
app.use('/trainControlImages', express.static(__dirname + '/trainControlImages')); 
app.get('/', function(req, res) {
  res.render('trainControls.jade', { layout: false });
});
app.listen(8080)
