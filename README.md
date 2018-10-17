# metilda
Audio analysis web app.

## Links
### Web App
- Dev site: https://metilda-dev.herokuapp.com
### DevOps
- Repo: https://github.com/mitchl2/metilda 
- Travis CI: https://travis-ci.com/mitchl2/metilda
- Heroku (Dev site): https://dashboard.heroku.com/apps/metilda-dev

## Supported Platforms
Tested on Windows, but should work on Linux as well (the test suite is run on a Linux VM).

## Build Configuration
1) Install a Python interpreter using the version specified in runtime.txt
1) Create a virtualenv under the /venv folder
1) Run `./venv/Scripts/python -r requirements.txt` 

## Tests
After configuring your build environment, run tests locally using `./tesh.sh`. 

Note, tests are also run prior to a push in `./push.sh`. Upon being pushed, the test suite is also
run on travis ci.

### Travis CI Prequisites
Running tests in a travis ci pipeline requires that you have:
- Installed travis CLI
- Installed heroku CLI
- Repo hosted on GitHub
- Personal access token from your GitHub account

### Travis CI Configuration
The `.travis.yml` file contains the configuration for running tests on travis ci. Note the
`secure` field was made using these commands:
1) `cmd> heroku login`
1) `cmd> travis login --pro --github-token <YOUR_GIT_HUB_TOKEN>`
1) `cmd> heroku authorizations:create`
1) `cmd> travis encrypt <TOKEN_FROM_PREVIOUS_OUTPUT> --add`
1) Verify that the secure token has been set under `deploy > api_key`
  
## Deployment
The application is deployed to Heroku after tests pass in travis ci.

### Deploy Configuration
The Python buildpack is configured for the application on Heroku. Additionally, several files are used by Heroku upon
deployment:
- `runtime.txt` determines the Python interpreter version
- `Procfile` includes the command that is used to start the web server 

To initiate deployment: 
1) Run `./push.sh` to deploy to Heroku
1) Wait for tests to pass in travis ci and then check the appropriate web app environment in Heroku. 