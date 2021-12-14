# metilda
[![Build Status](https://travis-ci.com/metilda-uw/metilda.svg?branch=master)](https://travis-ci.com/metilda-uw/metilda)
[![Coverage Status](https://coveralls.io/repos/github/metilda-uw/metilda/badge.svg?branch=master)](https://coveralls.io/github/metilda-uw/metilda?branch=master)

Audio analysis web app.

## Links
### Web App
- Stage site: https://metilda-stage.herokuapp.com/
- Prod site: https://metilda.herokuapp.com/

### DevOps
- Repo: https://github.com/metilda-uw/metilda
## Supported Platforms
Ubuntu Linux 20.04

## Build and Run
### Python
1) Install a Python interpreter (the version is specified in runtime.txt, it is currently 3.8.10). 
   <a href="https://help.dreamhost.com/hc/en-us/articles/115000218612-Installing-a-custom-version-of-Python-2"> Installation Instructions </a> 
3) Create a virtualenv under the /venv folder
4) Run these commands:
```
./venv/Scripts/python -r requirements.txt
./bin/runLocalServer.sh
```

### React
1) Install nodejs (the version is specified in `/frontend/package.json`, it is currently 14.18.2)
2) Install <a href="https://heynode.com/tutorial/install-nodejs-locally-nvm">Node Version Manager</a>
3) Run the following commands to switch to the correct version of node (Important for successfully running the frontend)
```
nvm install 14.18.2
nvm use 14.18.2
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
After configuring your build environment, run tests locally using `./bin/runTests.sh`.  For example:

/metilda$ ./bin/runTests.sh --python


### Load Tests
To test web server behavior under load conditions use `./bin/loadTests.sh XXX` where XXX is 5, 50, or 500 (the
number of simulated users).

### Travis CI Configuration (Currently outdated)
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
The application is deployed to Heroku.

### Deploy Configuration
The Python buildpack is configured for the application on Heroku. Additionally, several files are used by Heroku upon
deployment:
- `runtime.txt` determines the Python interpreter version
- `Procfile` includes the command that is used to start the web server 

To initiate deployment: 
1) Run `./bin/push.sh` to deploy to Heroku
1) Wait for tests to pass in Travis CI and then check the appropriate web app environment in Heroku. 


## Development Environment
### Build and Run on Ubuntu 20.04
### Install Prerequisite Packages

```
$ sudo apt-get update
$ sudo apt-get install build-essential checkinstall virtualenv python-dev-is-python3 postgresql postgresql-contrib libpq-dev libfreetype6-dev libxft-dev ffmpeg
```

### Install Praat - In order for the PELDA page to work the following steps need to be completed.  https://www.fon.hum.uva.nl/praat/download_linux.html

```
$ wget https://www.fon.hum.uva.nl/praat/praat6156_linux64nogui.tar.gz
$ tar xzf praat6156_linux64nogui.tar.gz
$ cp praat_nogui /usr/bin/
```

### Clone the Metilda Repository

```
$ git clone https://github.com/metilda-uw/metilda.git 
```

### Create and activate a virtual environment

```
$ virtualenv metilda --python=3.8.10
$ cd metilda
$ source bin/activate
```

### Alternative Option: Create a virtual environment via PyCharm & Follow PyCharm IDE Configuration steps
https://www.jetbrains.com/help/pycharm/creating-virtual-environment.html

### Verify that Python and Pip are installed correctly

```
$ python -V
$ pip -V
```

### Install requirements.txt

```
$ pip install -r requirements.txt
```

### Install Node and NVM 

1) Install nodejs (the version is specified in `/frontend/package.json`, it is currently 14.18.2).  You can install the current version of Node then use nvm to manage the version used in the project.

```
$ apt install nodejs
```

2) Install <a href="https://heynode.com/tutorial/install-nodejs-locally-nvm">Node Version Manager</a>
3) Run the following commands to install and switch to the correct version of node (Important for successfully running the frontend)

```
$ nvm install 14.18.2
$ nvm use 14.18.2
```

### Run backend (After activating the virtual environment)

```
$ cd src
$ python -m metilda.local_server
```

### Install NPM Packages 

```
$ cd frontend
$ npm install
```

### Run frontend(In an additional terminal Window) 

```
$ cd frontend
$ npm start
```