72 Fest App
===========


#Requirements

* nodejs
* ruby
* mysql
* mongodb
* grunt
* phonegap

## Setup

To get started,  you'll need nodejs and mongodb installed.

### Installing Homebrew

If on the Mac, the easiest way to manage open source packages is through homebrew. Homebrew is written in Ruby and can be installed with one line:

```
$ ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```

To properly compile everything, you need to get Xcode command line tools. They can be retrieved with the following command:

```
$ xcode-select --install
```

### Mongodb Setup

Now that homebrew is set up, install mongodb

```
$ brew install mongodb
```

After the installation completes, manually start mongodb

```
$ mongod --config /usr/local/etc/mongod.conf
```

**NOTE:** You will have to manually start mongodb after each restart.

You can optionally set mongodb to run at login time by typing the following:

```
$ ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
```

Then to launch mongodb now type the following (this will not have to be typed after restarting):

```
$ launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
```


### Initial Setup

After cloning the project or pulling in new changes to the project, npm and bower must be run to ensure all the dependencies are retrieved. A grunt class was created to simplify the process.

```
$ grunt install
```

Next, since we are using SASS we need to install the Ruby gem name compass (not sure if this is needed to be honest)

```
$ sudo gem install compass
$ sudo gem install bootstrap-sass
```

Lastly, run the default grunt task that will lint the Javascript files, compile the CSS and start watching for file changes.

```
$ grunt
```

The prompt should wait for any changes to the SASS files. When making any CSS changes, edit the .scss files, not the .css files. By running grunt, whenever a .scss file changes, the .css file will regenerate with the updated changes.


To launch an instance of the app within a browser rather than just watching for scss changes by running the following:

```
$ grunt serve
```

A browser instance should be launched and will auto refresh whenever a file is changed.

### Server Setup
Express is used to provide the RESTful api. Before you can launch the server, you need all of the dependencies.

```
$ cd server
$ npm install
```

Create the config.json file and edit the baseUrl and start time for when the filming begins for the 72Fest event

```
$ cp config.example.json
$ vi config.json
```

The node server uses imagemagick to process the images and must be installed on your system.

#### On Ubuntu

```
$ apt-get install imagemagick
```
#### On Mac OS X

```
$ brew install imagemagick
```

#### On CentOS

````
$ yum install imagemagick

```


To start the server, run the following from inside the server folder

```
$ npm start
```

**NOTE:** The server also will be started when running `grunt serve`.

## Phonegap

Phonegap wraps the HTML into an iOS/Adroid app which how the code will be delivered. Before getting started with phonegap make sure you installed Xcode if you're wanting to install the app locally.

We need to make sure we have phonegap installed globally

```
$ npm install -g phonegap
```

### iOS Setup

Phonegap requires additional npm packages to deploy to the iOS device and iOS simulator. This only has to be run once.

```
$ npm install -g ios-sim
$ npm install -g ios-deploy
```

### Stage code for Phonegap

Before deploying the app to phonegap, the current source code and related assets must be staged into the proper folders. We currently have a basic grunt process that runs the build process and copies the output into the proper phonegap directories.

```
$ grunt stage
```

After running the stage process, the latest codebase is staged for deployment to the emulator or mobile device.

### Launching app on iOS

Phonegap can be used to launch the app in either the simulator or directly to the device.

To launch with the simulator:

```
$ phonegap run ios --emulator
```

To launch directly to the device:

```
$ phonegap run ios --device
```

Alternatively, a grunt tasks were created to both stage and launch the app into phonegap.

#### Launching App for iOS to Device Using Grunt

```
$ grunt device
```

#### Launching App for iOS to Simulator Using Grunt

```
$ grunt simulator
```
