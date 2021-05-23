# metilda
[![Build Status](https://travis-ci.com/metilda-uw/metilda.svg?branch=master)](https://travis-ci.com/metilda-uw/metilda)
[![Coverage Status](https://coveralls.io/repos/github/metilda-uw/metilda/badge.svg?branch=master)](https://coveralls.io/github/metilda-uw/metilda?branch=master)

Audio analysis web app.

## Links
### Web App
- Dev site: https://metilda-dev.herokuapp.com
- Prod site: https://metilda.herokuapp.com/
### DevOps
- Repo: https://github.com/mitchl2/metilda 
- Travis CI: https://travis-ci.com/mitchl2/metilda
- Heroku (Dev site): https://dashboard.heroku.com/apps/metilda-dev

## Supported Platforms
Tested on Windows, but should work on Linux as well (the test suite is run on a Linux VM).

## Build and Run
### Python
1) Install a Python interpreter (the version is specified in runtime.txt, it is currently 2.7.15). 
   <a href="https://help.dreamhost.com/hc/en-us/articles/115000218612-Installing-a-custom-version-of-Python-2"> Installation Instructions </a> 
3) Create a virtualenv under the /venv folder
4) Run these commands:
```
./venv/Scripts/python -r requirements.txt
./bin/runLocalServer.sh
```

### React
1) Install nodejs (the version is specified in `/frontend/package.json`, it is currently 8.12.0)
2) Install <a href="https://heynode.com/tutorial/install-nodejs-locally-nvm">Node Version Manager</a>
3) Run the following commands to switch to the correct version of node (Important for successfully running the frontend)
```
nvm install 8.12.0
nvm use 8.12.0
```

5) Run these commands:
```
cd frontend
npm install 
npm start
```

## PyCharm IDE Configuration
### TSLint
This feature enables tslint highlighting, it is only available in the Professional edition of PyCharm.
##### Configure tsconfig.json
1) Open `Settings -> Language & Frameworks -> TypeScript`
1) Set `Options` to `--project ./frontend/tsconfig.json`
##### Configure tslint.json
1) Open `Settings -> Language & Frameworks -> TypeScript -> TSLint`
1) Select `Enable`
1) Set `TSLint Package` to `<REPO_DIR>\frontend\node_modules\tslint`
1) Set `Configuration file` to `<REPO_DIR>\frontend\tslint.json`

## Tests

### Unit Tests
After configuring your build environment, run tests locally using `./bin/runTests.sh`. 

Note, tests are also run prior to a push in `./bin/push.sh`. Upon being pushed, the test suite is also
run on Travis CI.

### Load Tests
To test web server behavior under load conditions use `./bin/loadTests.sh XXX` where XXX is 5, 50, or 500 (the
number of simulated users).

### Travis CI Configuration
Changing the Travis CI pipeline configuration requires that you have:
- Installed travis CLI
- Installed heroku CLI
- Repo hosted on GitHub
- Personal access token from your GitHub account

The `.travis.yml` file contains the configuration for running tests on Travis CI. Note the
`secure` field was made using these commands:
1) `cmd> heroku login`
1) `cmd> travis login --pro --github-token <YOUR_GIT_HUB_TOKEN>`
1) `cmd> heroku authorizations:create`
1) `cmd> travis encrypt <TOKEN_FROM_PREVIOUS_OUTPUT> --pro --add`
1) Verify that the secure token has been set under `deploy > api_key`
  
## Deployment
The application is deployed to Heroku after tests pass in Travis CI.

### Deploy Configuration
The Python buildpack is configured for the application on Heroku. Additionally, several files are used by Heroku upon
deployment:
- `runtime.txt` determines the Python interpreter version
- `Procfile` includes the command that is used to start the web server 

To initiate deployment: 
1) Run `./bin/push.sh` to deploy to Heroku
1) Wait for tests to pass in Travis CI and then check the appropriate web app environment in Heroku. 


## Build and Run on Ubuntu 20.04
### Install Python 2.7.15 & PIP on Ubuntu 20.04
$ sudo apt-get update

$ sudo apt-get install build-essential checkinstall

$ sudo wget https://www.python.org/ftp/python/2.7.15/Python-2.7.15.tgz

$ sudo tar –xvzf  Python-2.7.15.tgz

$ cd Python-2.7.15

$ sudo ./configure  –enable-optimizations --with-ensurepip=install

$ sudo make install

### Make sure to check if they're installed correctly
$ python -V

$ pip -V

### Create a virtual environment via PyCharm && Follow above PyCharm IDE Configuration steps
https://www.jetbrains.com/help/pycharm/creating-virtual-environment.html

### Install requirements.txt
$ pip install -r requirements.txt

### Go to matilda-master folder & Activate virtual environment
$ source venv/scripts/activate

$ sudo apt update

$ sudo apt-get install postgresql postgresql-contrib

$ sudo apt-get install libpq-dev

$ sudo apt-get install python-pip

### Run backend(After virtual environment activation)
$ cd src

$ python2 -m metilda.local_server

### Run frontend(On another Ubuntu) 
$ cd frontend

$ npm install

$ npm install -g npm-check-updates

$ npm start

