// This file contains code that finds the available bandwidth. Used to go to a lower bandwidth mode if needed.

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

// Controls the bandwidth field in teh page.
function setBandwidth(form){
	bandwidth = form.bandwidth.value;
	if(bandwidth.toLowerCase() == "high"){
		if(send_loop_id == null){
			//do nothing
		}else{
			toggle_to_high();
			send_toggle_message("high");
		}
		
	}else if(bandwidth.toLowerCase() == "low"){
		if(send_loop_id == null){
			toggle_to_low();
			send_toggle_message("low");
		}else{
			//do nothing
		}
	}else{
		alert("Only High or Low accepted not: "  + bandwidth);
	}
	return false;
}