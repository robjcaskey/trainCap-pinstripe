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


function Debouncer(max_interval) {
    this.debounce = function(f) {
      if(typeof(this.last_ran) == 'undefined') {
        f();
        this.last_ran = new Date();
      }
      else if(new Date() - this.last_ran > max_interval) {
        clearTimeout(this.waiting_fun);
        this.waiting_fun = undefined;
        f();
	this.last_ran = new Date();
      }
      else {
        if(typeof(this.waiting_fun) != 'undefined') {
          clearTimeout(this.waiting_fun)
        }
        this.waiting_fun = setTimeout(function(debouncer, f) {
          return function() {
            f();
            this.last_ran = new Date();
          }
        }(this,f), max_interval+25);
      }
    }
}

var speed_debouncer = new Debouncer(250);
var force_debouncer = new Debouncer(250);

io.on('connection', function(socket) {
  console.log("GOT a connection")
  socket.on('viewerConnected', function(data) {
    console.log("GOT VIEWER")
  });
  socket.on('targetConnected', function(data) {
    console.log("GOT Target")
  });
  socket.on('requestSpeed', function(data) {
    //console.log("GOT SPEED REQUEST"+JSON.stringify(data))
    speed_debouncer.debounce(function(data) {
      return function() {
        console.log("send out speed suggestion")
        io.sockets.emit('setSpeed', data)
      }
    }(data));
    var force_data = {
      speed:data.speed,
      socketId:socket.id
    }

    force_debouncer.debounce(function(force_data) {
      return function() {
        console.log("send out speed force")
        io.sockets.emit('forceSpeed', force_data)
      }
    }(force_data))
  });
  socket.on('activateF', function(data) { 
    var out_data = {}
    out_data.f = data.desc;
    io.sockets.emit('setF', out_data)
    console.log("GOT ACTIVATION REQUEST "+JSON.stringify(data))
  });
  socket.on('deactivateF', function(data) { 
    var out_data = {}
    out_data.f = data.desc;
    io.sockets.emit('unsetF', out_data)
    console.log("GOT DEACTIVATION REQUEST "+JSON.stringify(data))
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
app.get('/jsonAbout', function(req, res) {
  res.jsonp({
    serviceName:"trainCap"
  })
});
server.listen(8080)
