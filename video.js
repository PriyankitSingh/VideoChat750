var video_out = document.getElementById("vid-box");
//var vid_thumb = document.getElementById("vid-thumb");

var snap = document.getElementById("snap");
var snap_context = snap.getContext('2d');

var my_session = null;
var vidCount = 0;
var bandwidth = 250;
var sessionList = [];

var video = document.getElementById('myVideo');
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var faceCanvas = document.getElementById('faceOnly');
var ctx = faceCanvas.getContext('2d');

//In ms, rate at which we send pictures
var interval = 1000;


var statsContainer = document.getElementById("statsContainer");

// This function measures the availableBandwidth
function invokeGetStats(peerConnection){
	getStats(peerConnection, function(result ) {
		var tableRow =  document.getElementById('peer-stats-' + peerConnection.number);
		if(!tableRow) {
			tableRow = document.createElement('tr');
			tableRow.id ='peer-stats-' + peerConnection.number;
			console.log(tableRow.id);
			statsContainer.appendChild(tableRow);
		}

		var rowElements = '<td>' + peerConnection.number + '</td>';

        if(result.audio.availableBandwidth) {
            rowElements += '<td>' + result.audio.availableBandwidth + ' kbps</td>';
        }
		if(result.video.availableBandwidth) {
			rowElements += '<td>' + result.video.availableBandwidth + ' kbps</td>';
		}

		tableRow.innerHTML = rowElements;

		if (result.datachannel && result.datachannel.state === 'close') {
			tableRow.parentNode.removeChild(tr);
			result.nomore();
		}
		window.getStatsResult = result;
	}, 5 * 1000);

}


function setBandwidth(form){
	bandwidth = form.bandwidth.value;
	return false;
}

function login(form) {

	var phone = window.phone =
	PHONE({
	    number        : form.username.value || "Anonymous",
		autocam				: false,
		publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c', // Your Pub Key
	    subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe', // Your Sub Key
		media : {audio :true, video: true}
	    //publish_key   : 'pub-c-4972d566-854b-41ef-9f97-25d40f968e28',
	    //subscribe_key : 'sub-c-0369f0f0-0bc7-11e7-9734-02ee2ddab7fe',
	});

	var ctrl = window.ctrl = CONTROLLER(phone, get_xirsys_servers);
	ctrl.ready(function(){
			form.username.style.background="#55ff5b";
			form.login_submit.hidden="true";
			//Here we possibly want to minimise the user's screen
			//ctrl.addLocalStream(video);
			//addLog("Logged in as " + form.username.value);
			console.log("Logged in as " + form.username.value);
	});
	ctrl.receive(function(session){
	    session.connected(function(session){
			sessionList.push(session);
			video_out.appendChild(session.video);
			var sessionRTCPeerConnection = session.pc;
			invokeGetStats(sessionRTCPeerConnection);
			 //Adding button for kicking a session
			//var kickbtn = document.createElement("button");
			//video_out.appendChild(kickbtn);
			//addLog(session.number + " has joined.");
			console.log(session.number + " has joined.");
			vidCount++; });

	    session.ended(function(session) {
			var index = sessionList.indexOf(session);
			sessionList.splice(index,1);
			ctrl.getVideoElement(session.number).remove();
			//addLog(session.number + " has left.");
			console.log(session.number + " has left.");
			vidCount--;});
	});

	ctrl.videoToggled(function(session, isEnabled){
		ctrl.getVideoElement(session.number).toggle(isEnabled);
		//addLog(session.number+": video enabled - " + isEnabled);
		console.log(session.number+": video enabled - " + isEnabled);
	});
	ctrl.audioToggled(function(session, isEnabled){
		ctrl.getVideoElement(session.number).css("opacity",isEnabled ? 1 : 0.75);
		//addLog(session.number+": audio enabled - " + isEnabled);
		console.log(session.number+": audio enabled - " + isEnabled);
	});
	phone.message(function(session,message){
		var img = new Image();
		img.src = message.image.data;
		snap_context.drawImage(img,0,0);
		//console.log(message);
	});
	return false;
}

function makeCall(form){
	if (!window.phone) alert("Login First!");
	var num = form.number.value;
	if (phone.number()==num) return false; // No calling yourself!

	ctrl.isOnline(num,
		function(isOn){
			if (isOn){
				my_session = ctrl.dial(num);
			}
			else alert("User if Offline");
		}
	);
	return false;
}


function mute(){
	var audio = ctrl.toggleAudio();
	if (!audio) $("#mute").html("Unmute");
	else $("#mute").html("Mute");
}

function end(){
	ctrl.hangup();
}

function pause(){
	var video = ctrl.toggleVideo();
	if (!video) $('#pause').html('Unpause');
	else $('#pause').html('Pause');
}

function getVideo(number){
	return $('*[data-number="'+number+'"]');
}

//
// function addLog(log){
// 	$('#logs').append("<p>"+log+"</p>");
// }

	function get_xirsys_servers() {
    var servers;
    $.ajax({
        type: 'POST',
        url: 'https://service.xirsys.com/ice',
        data: {
            room: 'default',
            application: 'default',
            domain: 'kevingleason.me',
            ident: 'gleasonk',
            secret: 'b9066b5e-1f75-11e5-866a-c400956a1e19',
            secure: 1,
        },
        success: function(res) {
	        console.log(res);
            res = JSON.parse(res);
            if (!res.e) servers = res.d.iceServers;
        },
        async: false
    });
    return servers;
}

function errWrap(fxn, form){
	try {
		return fxn(form);
	} catch(err) {
		alert("WebRTC is currently only supported by Chrome, Opera, and Firefox");
		return false;
	}
}

function send_img(){
	setInterval(function(){
		//var img = new Image();
		//console.log(ctx);
		//img.src = faceCanvas.toDataURL();
		//console.log(ctx);
		//console.log(phone);
		//console.log(ctrl);
		if(!phone || my_session == null){
			console.log("not ready yet");
			return;
			}
		var pic = phone.snap();
		pic.data = faceCanvas.toDataURL("image/jpeg");
		//console.log(img);
		//console.log(pic);
		//snap.append(pic.image);
		phone.send({ image : pic });
	}, interval);
}

function start_face_tracker(){
  console.log("print");
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
