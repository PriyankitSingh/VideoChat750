window.onload = function() {
  console.log("print");
  var video = document.getElementById('myVideo');
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');
  var faceCanvas = document.getElementById('faceOnly');
  var ctx = canvas.getContext('2d');

  var tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);

  tracking.track('#myVideo', tracker, { camera: true }); // tracker with a camera.

  tracker.on('track', function(event) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function(rect) {
      ctx.drawImage(video, rect.x, rect.y, 400, 300, 0, 0, rect.width, rect.height);
      // context.strokeStyle = '#a64ceb';
      // context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      // context.font = '11px Helvetica';
      // context.fillStyle = "#fff";
      // context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
      // context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    });
  });

  var gui = new dat.GUI();
  gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
  gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
  gui.add(tracker, 'stepSize', 1, 5).step(0.1);
};