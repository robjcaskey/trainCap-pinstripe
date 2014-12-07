
function makeJoystick(joystick, train) {
	var container = document.createElement("div");
	var handle = document.createElement("div")
	var txtNode = document.createTextNode("0");
	var lblContainer = $("<div>")
	$(lblContainer).css({
		float:'left',
		position:'relative',
		top:'85px',
		left:'140px',
		width:'50px',
		textAlign:'right',
		fontSize:'22px',
		color:'red',
		backgroundColor:'black',
		zIndex:-240
	})
	lblContainer.append($(txtNode));
	var backgroundDecoration = document.createElement("div")
	$(handle).css({
		height:'100px',
		width:'50px',
		position:'absolute',
		'margin-top':'-10px',
		zIndex:30
	});
	var handleImg = $("<img>")
	handleImg.attr('src', 'trainControlImages/rheostatSlider.png');
	handleImg.css({'height':'100px'})
	$(handle).append(handleImg);
	$(container).css({
		height:'150px',
		width:'300px',
		clear:'left'
	})
	$(backgroundDecoration).css({
		height:'64px',
		width:'300px',
		position:'absolute',
		backgroundImage:'url(trainControlImages/rheostatBackground.png)',
		backgroundSize:'15%',
		marginTop:'20px'
	});
	$(handle).draggable({containment:"parent","axis":"x",drag:function() {
		var parent_offset = $(handle.parentElement).offset().left;
		var child_offset = $(handle).offset().left;
		var parent_width = $(handle.parentElement).width();
		var child_width = $(handle).width();
		var offset_delta = child_offset - parent_offset;
		var width_delta = parent_width - child_width;
		var control_range = width_delta;
		var pctg = offset_delta / control_range;
		train.requestSpeed(parseInt(pctg*100))
	}});
	$(container).append(handle);
	$(container).append(lblContainer)
	$(container).append(backgroundDecoration);
	$(joystick).append(container);
	document.addEventListener('requestSpeed', function(e) {
		txtNode.nodeValue = parseInt(e.speed)
	}, false);
}

function SpeedGauge(speedGaugeTgt, train) {
	var container = document.createElement("div");
	this.train = train
	$(container).css({
		paddingTop:'-30px',
		color:'black',
		fontSize:'32px',
		textAlign:'right',
		height:'185px',
		width:'200px',
		fontFamily:'monospace',
		float:'left',
	})
	var ndlImg = $("<img>")
	var arrowSrc = "trainControlImages/spedoArrow.png";
	ndlImg.attr('src', arrowSrc);
	var deg_txt = 'rotate(42deg)';
	ndlImg.css({
		position:'relative',
		zIndex:'150',
		left:'-50px',
		top:'-147px',
		height:'115px',
		'transform':deg_txt,
		'-ms-transform':deg_txt,
		'-webkit-transform':deg_txt
	});
	var gaugeImg = $("<img>")
	var gaugeSrc = "trainControlImages/spedoBackground.png";
	gaugeImg.attr('src', gaugeSrc);
	gaugeImg.css({
		width:'200px',
	})
	$(container).append(gaugeImg)
	$(container).append(ndlImg)
	$(speedGaugeTgt).append(container);
	socket.on('setSpeed', $.throttle(200, false, function(data) {
		var deg_span = 270
		var chg = (data.speed/100)*deg_span
		var x = 42+chg
		var deg_txt = "rotate("+x+"deg)"
		$(ndlImg).css({
			'transform':deg_txt,
			'-ms-transform':deg_txt,
			'-webkit-transform':deg_txt,	
			'transition':'.3s linear'
		})
	}));

}
/*
function makeSpeedTxt(speedGaugeTgt) {
	var container = document.createElement("div");
	var handle = document.createElement("div")
	var txtNode = document.createTextNode("0");
	$(handle).append(txtNode)
	$(container).css({
		backgroundColor:'black',
		fontSize:'64px',
		textAlign:'right',
		height:'100px',
		width:'150px',
		fontFamily:'monospace',
		clear:'left'
	})
	$(container).append(handle);
	$(speedGaugeTgt).append(container);
	return {
		setText: $.throttle(100, true, function(txt) {
			txtNode.nodeValue = txt
		})
	}
}
*/

function Train() {
	// locomotive 120 to 240 and cars 30 to 140 each
	// generally trains weigh 3000-8000 tons
	// typical 50s locomotoive pushed 670kw or 900hp
	// todo, actually do momentum formulas
	this.speed = 0
	this.momentumEnabled = false;
	this.requestedSpeed = 0;
/*
	this.trainBrain = setInterval(function(train) {
		return function() {
			if(train.momentumEnabled) {
				var d = train.requestedSpeed - train.speed;
				if(d != 0) {
					var new_speed;
					if(d > 0) {
						new_speed = Math.min(train.speed + .15, train.requestedSpeed)
					}
					else {
						new_speed = Math.max(train.speed - .5, train.requestedSpeed)
					}
				}
			}
		}
	}(this), 250)
*/
	this.requestSpeed = function(speed) {
		var e = new Event('requestSpeed');
		e.train = this
		e.speed = speed
		document.dispatchEvent(e)
		this.requestedSpeed = speed
		socket.emit('requestSpeed', {speed:speed})
	}
	document.addEventListener('requestSpeed', $.throttle(250, false, function(e) {
		dbgConsoleLog("requesting speed of "+e.speed)
	}), false);
}

function dbgConsoleLog(txt) {
	var logLine =document.createTextNode(txt);
	logLineContainer = $("<div>").append(logLine)
	$("#dbgConsole").append(logLineContainer);
}
function makeDivider(tgtDiv) {
	var hr = $("<div>")
	hr.css({
		clear:'left'
	})
	$(tgtDiv).append(hr)
}
function makePushButton(tgtDiv, lblTxt, cb) {
	this.active = false;	
	this.buttonImg = $("<img>")
	var onSrc = "trainControlImages/buttonPressed.png";
	var offSrc = "trainControlImages/button.png";
	this.buttonImg.attr('src', offSrc);
	this.buttonImg.css({'width':'42px'})

	$(this.buttonImg).click(function(pushButton) {
		return function() {
			if(!pushButton.active) {
				pushButton.active = true;
				pushButton.buttonImg.attr('src', onSrc)
				timeout = setTimeout(function() {
					if(pushButton.active) {
						pushButton.active = false;
						pushButton.buttonImg.attr('src', offSrc)
						cb()
					}
				}, 300);
			}
			return false;
		}
	}(this))
	this.buttonContainer = $("<div>")
	this.buttonContainer.css({
		'float':'left',
		'marginLeft':'auto',
		'marginRight':'auto',
		'padding':'5px'
	})
  	new makeLabel(this.buttonContainer,lblTxt)
	$(this.buttonContainer).append(this.buttonImg)
	$(tgtDiv).append(this.buttonContainer)
}

function ToggleSwitch(tgtDiv, lblTxt) {
	this.active = false;	
	this.switchImg = $("<img>")
	this.onToggle = function() {
	}
	var onSrc = "trainControlImages/switchOn.png";
	var offSrc = "trainControlImages/switchOff.png";
	this.switchImg.attr('src', offSrc);
	this.switchImg.css({'width':'64px'})
	$(this.switchImg).click(function(toggleSwitch) {
		return function() {
			if(toggleSwitch.active) {
				toggleSwitch.active = false;
				toggleSwitch.switchImg.attr('src', offSrc)
			}
			else {
				toggleSwitch.active = true;
				toggleSwitch.switchImg.attr('src', onSrc)
			}
			toggleSwitch.onToggle();
		}
	}(this))
	this.switchContainer = $("<div>")
	this.switchContainer.css({
		'float':'left',
		'marginLeft':'auto',
		'marginRight':'auto',
		'padding':'5px'
	})
  	new makeLabel(this.switchContainer,lblTxt)
	$(this.switchContainer).append(this.switchImg)
	$(tgtDiv).append(this.switchContainer)
}

function makeLabel(tgtDiv, lblTxt) {
	this.labelDiv = $("<div>")
	this.labelDiv.css({
		width:'62px',
		height:'32px',
		backgroundImage:'url(trainControlImages/label.png)',
		backgroundSize:'100%'
	})
	this.labelText = $("<div>")
	this.labelText.css({
		color:'black',
		fontSize:'16px',
		textShadow:'0px 3px 2px silver',
		textAlign:'center',
		fontFamily:'san-serif'
	})
	this.labelText.append(document.createTextNode(lblTxt))
	$(this.labelDiv).append(this.labelText)
	this.labelImg = $("<img>")
	this.labelImg.css({
		float:'left'	
	})
	//$(this.labelDiv).append(this.labelImg)
	var imgSrc = "trainControlImages/label.png";
	this.labelImg.attr('src', imgSrc);
	this.labelImg.css({'width':'96px'})
	$(tgtDiv).append(this.labelDiv)
}

$(document).ready(function() {
  var someTrain = new Train();
  makeJoystick($("#someJoystick"), someTrain)
/*
  var anotherSpeedLed = makeSpeedTxt($("#anotherSpeed"));
  var anotherTrain = makeTrain();
  makeJoystick($("#anotherJoystick"), anotherSpeedLed, anotherTrain)
*/
  new ToggleSwitch($("#trainBar"),"Reverse")
  var momentumSwitch = new ToggleSwitch($("#trainBar"),"Momtm")
  momentumSwitch.onToggle = function(toggleSwitch, train) {
    return function() {
      socket.emit('toggleF', {'desc':'momentum'})
//      train.momentumEnabled = toggleSwitch.active
    }
  }(momentumSwitch, someTrain)
  new ToggleSwitch($("#trainBar"),"Lights")
  new makePushButton($("#trainBar"),"Horn", function() {
    socket.emit("activateF",{desc:"horn"})
  })
  new makePushButton($("#trainBar"),"Engine", function() {
    socket.emit("activateF",{desc:"engine"})
  })
  var speedGauge = new SpeedGauge($("#trainBar"), someTrain);
  new makePushButton($("#trainBar"),"Brake", function() {
  })
  new makePushButton($("#trainBar"),"", function() {
  })
  new makeDivider($("#trainBar"));
  new makePushButton($("#trainBar"),"Dbg", function() {
  })
  new makePushButton($("#trainBar"),"", function() {})
  new makePushButton($("#trainBar"),"", function() {})
  new makePushButton($("#trainBar"),"", function() {})

});
