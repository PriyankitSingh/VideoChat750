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