// This file contains code for switching between low and high quality streams. Low quality stream only sends the faces of the 
// other users rather than the video stream.

// Method to switch the GUI into the appropriate state. 
function toggle(message){
	if (isSnapVisible){
		isSnapVisible = false;
		video_out.style.display = 'block';
		snap_out.style.display = 'none';
		pause();
		end_send_loop();
		if(!message){
			send_toggle_message();
		}
		//window.phone.mystream.getVideoTracks()[0].enabled = true;
		//console.log(window.phone.mystream.getVideoTracks()[0].enabled);
	}else{
		isSnapVisible = true;
		video_out.style.display = 'none';
		snap_out.style.display = 'block';
		pause();
		send_img_loop();
		if(!message){
			send_toggle_message();
		}
		//window.phone.mystream.getVideoTracks()[0].enabled = false;
		//console.log(window.phone.mystream.getVideoTracks()[0].enabled);
	}
}

// Stops the fave only stream and starts the video stream
function toggle_to_high(){
	isSnapVisible = false;
	video_out.style.display = 'block';
	snap_out.style.display = 'none';
	pause();
	end_send_loop();
}

// Stops the video stream and starts sending images of faces.
function toggle_to_low(){
	isSnapVisible = true;
	video_out.style.display = 'none';
	snap_out.style.display = 'block';
	pause();
	send_img_loop();
}

// Sends a message to the other user that we have toggled our stream.
function send_toggle_message(toggle){
	phone.send({ toggleBandwidth : toggle });
}

