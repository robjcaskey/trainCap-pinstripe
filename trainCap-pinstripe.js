
/*
var express = require('express')
var app = express()
*/
var express = require('express')
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

function sendPy(cmd) {
  python_process.stdin.write(cmd+"\n")
}

io.on('connection', function(socket) {
  console.log("GOT a connection")
  socket.on('viewerConnected', function(data) {
    console.log("GOT VIEWER")
  });
  socket.on('targetConnected', function(data) {
    console.log("GOT Target")
  });
  socket.on('requestSpeed', function(data) {
    console.log("GOT SPEED REQUEST"+JSON.stringify(data))
    io.sockets.emit('setSpeed', data)
    var force_data = {
      speed:data.speed,
      socketId:socket.id
    }
    io.sockets.emit('forceSpeed', force_data)
  });
  socket.on('activateF', function(data) {
    console.log("GOT ACTIVATION REQUEST "+JSON.stringify(data))
  });
  socket.on('toggleF', function(data) {
    console.log("GOT TOGGLE REQUEST "+JSON.stringify(data))
  });
});

app.set('view engine', 'jade')
app.use('/bower_components', express.static(__dirname + '/bower_components')); 
app.use('/js', express.static(__dirname + '/js')); 
app.use('/trainControlImages', express.static(__dirname + '/trainControlImages')); 
app.get('/', function(req, res) {
  res.render('trainControls.jade', { layout: false });
});
server.listen(8080)
