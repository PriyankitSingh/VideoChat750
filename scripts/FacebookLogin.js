    /**
  * A lot of the code in this script has been generated by Facebook.
  * Facebook's code has not been changed.
  */
  // global variables
  var userName = null;
  var callee = null;
  var phone = null;
  var video_out = document.getElementById("vid-box");
  var vid_thumb = document.getElementById("myVideo");
  var vidCount = 0;
  var sessionList = [];
  var friendsList =[];

  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      testAPI();
      // log into pubnub
      loginPubnub();
    } else {
      // The person is not logged into your app or we are unable to tell.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  window.fbAsyncInit = function() {
  FB.init({
    appId      : '411780365862136',
    cookie     : true,  // enable cookies to allow the server to access
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.8' // use graph api version 2.8
  });

  // Now that we've initialized the JavaScript SDK, we call
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

  };

  // Load the SDK asynchronously
  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      userName = response.name;
      var container = document.getElementById('friends-container');
      var userElement = document.createElement("div");
      userElement.innerHTML = "<b>" + response.name + "</b>";

      userElement.addEventListener('click', function(event){
        // TODO: Just for testing
        // Call the user from here
        friendNumber = response.name;
        console.log('Calling: ' + friendNumber);
        startLocalStream();
        console.log('makeCallFacebook(friendNumber);');

      });
      container.appendChild(userElement);

      console.log(response);
      document.getElementById('status').innerHTML =
        'Welcome, ' + response.name + '!';
    });

    // fetch friends (only gets people who have signed up for this application)
    console.log('Fetching your friends');
    FB.api('/me/friends', function(response){
      if (response && !response.error) {

        var friends = response.data.sort(sortMethod);
        console.log('got a response. Number of friends: ' + friends.length);
        // var container = document.getElementById('friends-container');
        // container.innerHTML = '';
        var contactList= document.getElementById('contactsID');
        for (var i=0; i<friends.length; i++){
          if(friendsList.indexOf(friends[i].id)<0){
          console.log(friends[i].id + " " + friends[i].name);
          var friendName = friends[i].name;
          var friendId = friends[i].id;
          friendsList.push(friendId);
          var listItem = document.createElement('li');
          var friendElement = document.createElement("a");
          friendElement.innerHTML = "<img src=\"icons\\user.png\" alt=\"Profile Photo\"/> " + friends[i].name;
          listItem.appendChild(friendElement);
          (function (friendName, friendId){
            friendElement.addEventListener('click', function(event){
              // Call the user from here
              friendNumber = friendName;
              console.log('Calling: ' + friendNumber + ' using ' + friendId);
              startLocalStream();
              makeCallFacebook(friendId)
            });
          })(friendName, friendId);

          contactList.appendChild(listItem);
          // container.appendChild(friendElement);
          }
        }
      } else {
        console.log('got no response');
      }
    });
  }



function loginPubnub(){
  console.log('Logging in using PubNub');

  FB.api('/me', function(response) {
    if (response && !response.error){
      userName = response.id;

      phone = window.phone = PHONE({
        number        : userName || "Anonymous",
        publish_key   : 'pub-c-561a7378-fa06-4c50-a331-5c0056d0163c', // Your Pub Key
        subscribe_key : 'sub-c-17b7db8a-3915-11e4-9868-02ee2ddab7fe', // Your Sub Key
        //publish_key   : 'pub-c-4972d566-854b-41ef-9f97-25d40f968e28',
        //subscribe_key : 'sub-c-0369f0f0-0bc7-11e7-9734-02ee2ddab7fe',
      });

      startLocalStream();
    }
  });
}

var localStreamOn = false;

// Sets up the controller for the communication system and starts a video stream.
function startLocalStream(){
  if(localStreamOn){ // check if this setup has already been done
    console.log('local stream already on');
    return;
  } else {
    localStreamOn = true;
  }

  var ctrl = window.ctrl = CONTROLLER(phone, get_xirsys_servers);
  ctrl.ready(function(){
    // removed the form stuff
    ctrl.addLocalStream(video);
    start_face_tracker();
    console.log("Logged in as " + userName);
  });
  ctrl.receive(function(session){
    session.connected(function(session){
        video_out.appendChild(session.video);
        addLog(session.number + " has joined.");
        sessionList.push(session);
        //Get the availableBandwidth for this session
        //invokeGetStats is in the video.js script
        var sessionRTCPeerConnection = session.pc;
        invokeGetStats(sessionRTCPeerConnection);

        vidCount++; });
    session.ended(function(session) {
        ctrl.getVideoElement(session.number).remove();
        addLog(session.number + " has left.");
        //remove the session from the list of session when it ended
        var index = sessionList.indexOf(session);
        sessionList.splice(index,1);
        vidCount--;});
  });
  ctrl.videoToggled(function(session, isEnabled){
    ctrl.getVideoElement(session.number).toggle(isEnabled);
    addLog(session.number+": video enabled - " + isEnabled);
  });
  ctrl.audioToggled(function(session, isEnabled){
    ctrl.getVideoElement(session.number).css("opacity",isEnabled ? 1 : 0.75);
    addLog(session.number+": audio enabled - " + isEnabled);
  });
  return false;
}

  // a generic method used for sorting the list of friends in alphabetical order.
  function sortMethod(a, b) {
    var x = a.name.toLowerCase();
    var y = b.name.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  }
