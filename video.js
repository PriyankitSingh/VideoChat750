var video_out = document.getElementById("vid-box");
var othervideos = document.getElementById("othercallervideos");
//var vid_thumb = document.getElementById("vid-thumb");

//var snap = document.getElementById("snap");
var snap = document.createElement('canvas');
var snap_context = snap.getContext('2d');

var vidCount = 0;
var bandwidth = 250;
var sessionList = [];

var video = document.getElementById('myVideo');
var faceCanvas = document.createElement('canvas');
//var faceCanvas = document.getElementById('faceCanvas');
var ctx = faceCanvas.getContext('2d');

//In ms, rate at which we send pictures
var interval = 1000;
var send_loop_id = null;
var isSnapVisible = false;
var snap_out = document.getElementById('faceImages');

var participantBandwidths = [];

var phone;
var chatlogs = document.getElementById('chatlogs');

// This function measures the video availableBandwidth
function invokeGetStats(peerConnection){
	getStats(peerConnection, function(result ) {
		participantBandwidths[peerConnection.number]=  result.video.availableBandwidth;
		console.log(peerConnection.number +": " +participantBandwidths[peerConnection.number]);
		if (result.datachannel && result.datachannel.state === 'close') {
			delete dic[peerConnection.number];
			console.log("removed" + peerConnection.number);
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

	phone = window.phone =
	PHONE({
	    number        : form.username.value || "Anonymous",
		autocam		  : false,
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
			start_face_tracker();
			console.log("Logged in as " + form.username.value);
	});
	ctrl.receive(function(session){
	    session.connected(function(session){
			sessionList.push(session);
			var listItem = document.createElement('li');
			listItem.id= "callee" +session.number;
			listItem.appendChild(session.video);
			othervideos.appendChild(listItem);
			//video_out.appendChild(session.video);
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
			var listItem = document.getElementById('callee'+session.number);
			listItem.outerHTML ="";
			delete listItem;
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
		console.log("received image");
		if(message.hasOwnProperty("image")){
			var img = new Image();
			img.src = message.image.data;
			facesReceived[session.number] = img;
			snap.width = 200;
			snap.height = 200;
			var iteration = 1;
			var startX = 0;
			var startY = 0;
			img.onload = function(){
				snap_context.clearRect(0, 0, snap.width, snap.height);
				Object.keys(facesReceived).forEach(function (key) {
					var value = facesReceived[key];
					snap.height = 200 * iteration;
					snap_context.drawImage(img,0,startY);
					startX = startX + 200;
					startY = startY + 200;
				})
				snap_out.innerHTML = "";
				img.data = snap.toDataURL("image/jpeg");
				snap_out.appendChild(img);
			}
		}else{
			var friendDiv = document.createElement('div');
    		friendDiv.className ="chat friend";
    		var friendPhoto = document.createElement('div');
    		friendPhoto.className ="photo";
    		var image = document.createElement('img');
    		image.src="icons/minion2.png";
    		friendPhoto.appendChild(image);
    		var text = document.createElement('p');
    		text.className="message";
    		text.innerHTML=message.text;
    		friendDiv.appendChild(friendPhoto);
    		friendDiv.appendChild(text);
    		chatlogs.appendChild(friendDiv);
    		chatlogs.scrollTop=chatlogs.scrollHeight;
		}
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
				ctrl.dial(num);
			}
			else alert("User if Offline");
		}
	);
	return false;
}

function makeCallFacebook(friend){
	console.log('in makeCallFacebook ' + friend);
	if (!window.phone) alert("Login First!");
	var num = friend;
	if (phone.number()==num) return false; // No calling yourself!
	ctrl.isOnline(num, function(isOn){
		if (isOn) ctrl.dial(num); // error here calls line 85
		else alert("User is Offline");
	});
	return false;
}


function mute(){
	var audio = ctrl.toggleAudio();
	if (!audio) $("#mute").html("Unmute");
	else $("#mute").html("Mute");
}

function end(){
	console.log('ending stream');
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
    // TODO: this post request giving error
    $.ajax({
        type: 'POST',
        url: 'https://service.xirsys.com/ice',
        data: JSON.stringify({
            room: 'default',
            application: 'default',
            domain: 'kevingleason.me',
            ident: 'gleasonk',
            secret: 'b9066b5e-1f75-11e5-866a-c400956a1e19',
            secure: 1,
        }),
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
	}
}

function send_img(){

	var pic = phone.snap();
	pic.data = faceCanvas.toDataURL("image/jpeg");
	phone.send({ image : pic });

}

function toggle(){
	if (isSnapVisible){
		isSnapVisible = false;
		video_out.style.display = 'block';
		snap_out.style.display = 'none';
		window.phone.mystream.getVideoTracks()[0].enabled = true;
		console.log(window.phone.mystream.getVideoTracks()[0].enabled);
	}else{
		isSnapVisible = true;
		video_out.style.display = 'none';
		snap_out.style.display = 'block';
		window.phone.mystream.getVideoTracks()[0].enabled = false;
		console.log(window.phone.mystream.getVideoTracks()[0].enabled);
	}
}
/*
function start_face_tracker(){
  console.log("print");
  var tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);
  var faceContainer = document.getElementById('faceContainer');

  tracking.track('#myVideo', tracker, { camera: true }); // tracker with a camera.

  //
  tracker.on('track', function(event) {
  	if(event.data.length === 0){
  		console.log('no faces found');
  	} else {
	  	faceContainer.innerHTML = ''; // clear the div

	    // Loops through all faces found.
	    event.data.forEach(function(rect) {
	    	// create a new canvas for each face
	    	var singleFaceCanvas = document.createElement('canvas');
	    	singleFaceCanvas.height = 200;
	    	singleFaceCanvas.width = 200;
	    	var singleFaceContext = singleFaceCanvas.getContext('2d');

	    	singleFaceContext.drawImage(video, rect.x, rect.y, 400, 300,
	      						0, 0, singleFaceCanvas.width, singleFaceCanvas.height);
	    	faceContainer.appendChild(singleFaceCanvas);
<<<<<<< HEAD
	    });
  	}
=======
	    	// ctx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
	     // 	ctx.drawImage(video, rect.x, rect.y, 400, 300,
	     //  						0, 0, faceCanvas.width, faceCanvas.height);
	    });
  	}

>>>>>>> 026951c2a077bbffdb6097dcc12aeb37325cb002
  });
};
*/
function start_face_tracker(){
  var tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(4);
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
			faceCanvas.width += 200;
	    	ctx.drawImage(video, rect.x, rect.y, 400, 300, 
	      						startX, 0, faceCanvas.width, faceCanvas.height);
			startX = startX + 200;
			startY = startY + 200;
	    });
  	}
  });
};

function sendMessage(){
	var  tbox = document.getElementById("messageBox");
	var message=  tbox.value;
	console.log(phone);
	if(phone && message != ''){
		phone.send({text: message});
		var selfDiv = document.createElement('div');
    	selfDiv.className ="chat self";
    	var selfPhoto = document.createElement('div');
    	selfPhoto.className ="photo";
    	var image = document.createElement('img');
    	image.src="icons/minion1.png";
    	selfPhoto.appendChild(image);
    	var text = document.createElement('p');
    	text.className="message";
    	text.innerHTML=message;
    	selfDiv.appendChild(selfPhoto);
    	selfDiv.appendChild(text);
    	chatlogs.appendChild(selfDiv);
    	chatlogs.scrollTop=chatlogs.scrollHeight;
    	tbox.value='';
	}
}
