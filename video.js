var video_out = document.getElementById("vid-box");
function login(form) {
	var phone = window.phone = PHONE({
	    number        : form.username.value || "Anonymous", 
	    publish_key   : 'pub-c-4972d566-854b-41ef-9f97-25d40f968e28',
	    subscribe_key : 'sub-c-0369f0f0-0bc7-11e7-9734-02ee2ddab7fe',
	});	
	phone.ready(function(){ form.username.style.background="#55ff5b"; });
	phone.receive(function(session){
	    session.connected(function(session) { video_out.appendChild(session.video); });
	    session.ended(function(session) { video_out.innerHTML=''; });
	});
	return false; 	// So the form does not submit.
	
	
}
function makeCall(form){
	if (!window.phone) alert("Login First!");
	else phone.dial(form.number.value);
	return false;
}