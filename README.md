# VideoChat750
This is an alternate repo. Follow the instructions below for pushing to uni server.

How to pull/push from the alternative repo to the university server?
 - git remote add alternativerepo git@gitlab.com:randomId/repo.git 
 - git remote -v

Push/pull to alternative:
 - git pull alternativerepo 
 - git push alternativerepo
Push/pull to uni:
 - git pull origin 
 - git push origin

Anonymous commit messages:
In your project directory:
 - git config --local user.name "randomId" 
 - git config --local user.email "noemail@example.com"

 