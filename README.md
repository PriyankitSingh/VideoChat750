# VideoChat750
Web based video conferencing with graceful degradation in low bandwidth. In this project, we explored ways of 
keeping a sense of presence in low bandwidth, where a video link cannot be sustained. The program stops the video stream
and starts sending images of the user's face when the bandwidth drops below a certain threshold. The user's face is trasked
using a face tracking library  and multiple faces are supported.

To use the application to call your friends, simply log in using facebook and click the name of your facebook friend who you want to call.
Note that only the friends who have signed into the application once will show up in the friends list because of Facebook privacy policy.
You can also type a name and login using that id. You can call people by typing their id bet this system is not recommended as you have to know the exact name of the other person but this can be used for testing.


# Testing procedure 

1. In a terminal navigate to the project folder.

2. Create an http server by running the command:

 - In Python 2: "python -m SimpleHTTPServer"

 - In Python 3: "python -m http.server"

3. In chrome go to "localhost:8000", by typing it in the address bar.

4. Open another tab and go to "localhost:8000".

5. If you are logged into facebook leave by clicking "End". Find this button by hovering over the bottom of the main video (which is showing a video of yourself).

6. In both tabs login with a username by typing a username into the "Login!" text box and then clicking "Login". Make sure the tabs have unique usernames.

7. In one tab call the other user by typing their username into the "Call Someone!" text box, and then clicking "Call".

8. Switch between high and low bandwidth by typing either "high" or "low" in the "Set your bandwidth(High/Low)" text box and then clicking "set".


# Other

GitLab URL:
 - http://cerczeiprd01.its.auckland.ac.nz/
 
Google Docs:
 - https://drive.google.com/drive/folders/0Bwkj6-wqpkl0Mk13Ry04ZlkwcGc
