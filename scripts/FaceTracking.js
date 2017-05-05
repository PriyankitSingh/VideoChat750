// Method to  extract user's faces from the video "myVideo" and adds the face to the faceCanvas.
// This method can also track multiple faces at the same time.
// window.onload = function(){
function startFaceTracker(){
  var tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(10);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);

  tracking.track('#myVideo', tracker, { camera: true }); // tracker with a camera.
  tracker.on('track', function(event) {
    if(event.data.length === 0){
      //console.log('no faces found');
    } else {
      ctx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    var startX = 0;
    var startY = 0;
    faceCanvas.height = 200;
    faceCanvas.width = 0;
      // Loops through all faces found.
      event.data.forEach(function(rect) {
        // create a new canvas for each face 
        // console.log(rect); 
        faceCanvas.width += 200;
        var sx = rect.x * ( video.videoWidth/userVideoContainer.offsetWidth);
        var sy = rect.y * ( video.videoHeight/userVideoContainer.offsetHeight);
          ctx.drawImage(video, sx, sy, rect.width, rect.height, 
                      0, 0, 200, 200);
      
      startX = startX + 200;
      startY = startY + 200;
      });
    }
  });
};

// send images to other people
function send_img_loop(){
  if(send_loop_id == null){
    send_loop_id = setInterval(send_img, interval);
  }else{
    return;
  }
}

// stop sending images to other people
function end_send_loop(){
  if(send_loop_id == null){
    return;
  }else{
    clearInterval(send_loop_id);
    send_loop_id = null;
  }
}

function send_img(){

  var pic = phone.snap();
  pic.data = faceCanvas.toDataURL("image/jpeg");
  phone.send({ image : pic });

}

// Changes the rate of sending images. 
function change_send_img_rate(rate){
  interval = rate;
  if(send_loop_id == null){
    return;
  }else{
    end_send_loop();
    send_img_loop();
  } 
}