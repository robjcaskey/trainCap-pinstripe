var socket;
$(document).ready(function() {
  var origin = location.origin;
  socket = io.connect(origin);
  socket.emit('viewerConnected', {})
});
