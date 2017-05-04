var video_out = document.getElementById("vid-box");
var othervideos = document.getElementById("othercallervideos");

var snap = document.createElement('canvas');
var snap_context = snap.getContext('2d');

var vidCount = 0;
var bandwidth = 250;
var sessionList = [];

var video = document.getElementById('myVideo');
var faceCanvas = document.createElement('canvas');
var ctx = faceCanvas.getContext('2d');

//In ms, rate at which we send pictures
var interval = 1000;
var send_loop_id = null;
var isSnapVisible = false;
var snap_out = document.getElementById('faceImages');

var participantBandwidths = [];

var facesReceived = {};

var phone;
var chatlogs = document.getElementById('chatlogs');

// This function measures the video availableBandwidth
var faceOnly = false;
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
	faceOnly = false;
	console.log('setting up a video connection');
	var phone = window.phone =
	PHONE({
	    number        : form.username.value || "Anonymous",
		autocam		  : false,
		publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c', // Your Pub Key
	    subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe', // Your Sub Key
		media : {audio :true, video: true}
	});

	var ctrl = window.ctrl = CONTROLLER(phone, get_xirsys_servers);
	ctrl.ready(function(){
			form.username.style.background="#55ff5b";
			form.login_submit.hidden="true";
			console.log("Logged in as " + form.username.value);
	});
	ctrl.receive(function(session){
	    session.connected(function(session){
			sessionList.push(session);
			var listItem = document.createElement('li');
			listItem.id= "callee" +session.number;
			listItem.appendChild(session.video);
			othervideos.appendChild(listItem);
			var sessionRTCPeerConnection = session.pc;
			invokeGetStats(sessionRTCPeerConnection);
			console.log(session.number + " has joined.");
			vidCount++; });

	    session.ended(function(session) {
			var index = sessionList.indexOf(session);
			sessionList.splice(index,1);
			ctrl.getVideoElement(session.number).remove();
			var listItem = document.getElementById('callee'+session.number);
			listItem.outerHTML ="";
			delete listItem;
			console.log(session.number + " has left.");
			vidCount--;});
	});

	ctrl.videoToggled(function(session, isEnabled){
		ctrl.getVideoElement(session.number).toggle(isEnabled);
		console.log(session.number+": video enabled - " + isEnabled);
	});
	ctrl.audioToggled(function(session, isEnabled){
		ctrl.getVideoElement(session.number).css("opacity",isEnabled ? 1 : 0.75);
		console.log(session.number+": audio enabled - " + isEnabled);
	});

	phone.message(function(session,message){
		if(message.hasOwnProperty("image")){
			var img = new Image();
			img.src = message.image.data;
			facesReceived[session.number] = img; // TODO: var not declared
			var height = 0
			Object.keys(facesReceived).forEach(function (key) {
				height += 200;
			})
			snap.width = 200;
			snap.height = height;
			var startY = 0;
			img.onload = function(){
				snap_context.clearRect(0, 0, snap.width, snap.height);
				Object.keys(facesReceived).forEach(function (key) {
					console.log("drawing face:" + key);
					var value = facesReceived[key];
					snap_context.drawImage(value,0,startY);
					startY = startY + 200;
				})
				snap_out.innerHTML = "";
				var snap_img = new Image();
				snap_img.src = snap.toDataURL("image/jpeg");
				snap_out.appendChild(snap_img);
			}
		}else if(message.hasOwnProperty("text")){
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
		}else if (message.hasOwnProperty("toggleBandwidth")){
			console.log("Toggle Bandwidth:" + message.toggleBandwidth);
			toggleQuality(true);
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


