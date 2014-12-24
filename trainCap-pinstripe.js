/*
var express = require('express')
var app = express()
*/
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);
var https = require('https');
var fs = require('fs');
var child_process = require('child_process');

var UPDATE_URL = "https://raw.githubusercontent.com/robjcaskey/trainCap/master/provisioning/playbook.yml"

function getPasswordForNetwork(network_name, passphrase, cb) {
	var passphrase_process = child_process.exec("/usr/bin/wpa_passphrase", [network_name, passphrase])
        passphrase_process.stdout.on('data', function(data) {
		var lines = data.split("\n")
		var needle = "psk=";
		for(var i=0; i < lines.length; i++) {
			var line = lines[i].replace(/^\s+/,'');
			if(line.indexOf(needle) == 0) {
				cb(line.substr(needle.length));
			}
		}
        })
}


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
  socket.on('doUpgrade', function(data) {
    console.log("Should we do an upgrade?");
    var playbook_filename = "/tmp/playbook.yml" 
    var request = https.get(UPDATE_URL, function(res) {
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      })
      res.on('end', function() {
        fs.writeFileSync(playbook_filename, body);
        var upgrade_process = child_process.spawn("/usr/local/bin/ansible-playbook", [playbook_filename], {detached:true,stdio:'pipe'})
        upgrade_process.stdout.on('data', function(data) {
          io.sockets.emit('upgradeLog', data.toString())
          console.log(data.toString())
        })
        upgrade_process.stderr.on('data', function(data) {
          io.sockets.emit('upgradeLog', data.toString())
          console.log(data.toString())
        })
      });
    }); 
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
app.use(bodyParser.urlencoded({extended:false}));
app.use('/bower_components', express.static(__dirname + '/bower_components')); 
app.use('/js', express.static(__dirname + '/js')); 
app.use('/trainControlImages', express.static(__dirname + '/trainControlImages')); 
app.get('/', function(req, res) {
  res.render('trainControls.jade', { layout: false });
});
app.post('/addWpaSecret', function(req, res) {
  getPasswordForNetwork(req.body.essid,req.body.psk, function(crypted_psk) {
    var conf_data = "";
    conf_data += "network = {\n"
    + "\tssid="+JSON.stringify(req.body.essid)+"\n"
    + "\tpsk="+JSON.stringify(crypted_psk)+"\n"
    + "}";
    fs.appendFileSync("/etc/wpa_supplicant/wpa_supplicant.conf", conf_data)
    child_process.exec("ifdown wlan0", function() {
      child_process.exec("ifup wlan0", function() {
      });
    });
  })
  res.send("OK")
});
app.get('/jsonAbout', function(req, res) {
  res.jsonp({
    serviceName:"trainCap"
  })
});
server.listen(8080)
