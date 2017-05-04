//-----------------------------------------------------------------------------
//TESTING: 
function loginFaceOnly(form) {
	faceOnly = true;
	console.log('setting up a face only connection');
	var phone = window.phone =
	PHONE({
	    number        : form.username.value || "Anonymous",
		autocam				: false,
		publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c', // Your Pub Key
	    subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe', // Your Sub Key
		media : {audio :true, video: false}
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
			video_out.appendChild(session.video);
			var sessionRTCPeerConnection = session.pc;
			invokeGetStats(sessionRTCPeerConnection);			
			console.log(session.number + " has joined.");
			vidCount++; });

	    session.ended(function(session) {
			var index = sessionList.indexOf(session);
			sessionList.splice(index,1);
			ctrl.getVideoElement(session.number).remove();
			console.log(session.number + " has left.");
			vidCount--;});
	});

	ctrl.audioToggled(function(session, isEnabled){
		ctrl.getVideoElement(session.number).css("opacity",isEnabled ? 1 : 0.75);
		console.log(session.number+": audio enabled - " + isEnabled);
	});
	phone.message(function(session,message){
		if(message.hasOwnProperty("image")){
			var img = new Image();
			img.src = message.image.data;
			facesReceived[session.number] = img;
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


function toggleQuality(isFromMessage){
	console.log("in toggle video quality");
	
	if(!isFromMessage){
		// TODO: there could be a timing issue with send message and end stream
		send_toggle_message();
	}
	
	end();
	setTimeout(function redial(){
		
		var loginForm = document.getElementById("login");
		var callForm = document.getElementById("call")
		if(faceOnly){
			login(loginForm);
		} else {
			loginFaceOnly(loginForm);
		}
		// TODO toggle just for testing
		toggle();
		makeCall(callForm);	
	}, 5000);
	
}

function send_toggle_message(){
	var toggle = true;
	phone.send({ toggleBandwidth : toggle });
}

function toggle(){
	if (isSnapVisible){
		isSnapVisible = false;
		video_out.style.display = 'block';
		//snap_out.style.display = 'none';
		end_send_loop();
		//window.phone.mystream.getVideoTracks()[0].enabled = true;
		//console.log(window.phone.mystream.getVideoTracks()[0].enabled);
	} else {
		isSnapVisible = true;
		//video_out.style.display = 'none';
		snap_out.style.display = 'block';
		send_img_loop();
		// window.phone.mystream.
		//window.phone.mystream.getVideoTracks()[0].enabled = false;
		//console.log(window.phone.mystream.getVideoTracks()[0].enabled);
	}
}
