
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

function toggle_to_high(){
	isSnapVisible = false;
	video_out.style.display = 'block';
	snap_out.style.display = 'none';
	pause();
	end_send_loop();
}


function toggle_to_low(){
	isSnapVisible = true;
	video_out.style.display = 'none';
	snap_out.style.display = 'block';
	pause();
	send_img_loop();
}

function send_toggle_message(toggle){
	phone.send({ toggleBandwidth : toggle });
}

