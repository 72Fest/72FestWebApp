72 Fest App
===========


#Requirements

* nodejs
* mysql
* mongodb

## Setup

To get started,  you'll need nodejs and mongodb installed.

### Installing Homebrew

If on the Mac, the easiest way to manage open source packages is through homebrew. Homebrew is written in Ruby and can be installed with one line:

```
ruby -e "$(curl -fsSL https://raw.github.com/Homebrew/homebrew/go/install)"
```

To properly compile everything, you need to get Xcode command line tools. They can be retrieved with the following command:

```
xcode-select --install
```

### Mongodb Setup

Now that homebrew is set up, install mongodb

```
brew mongodb
```

After the installation completes, manually start mongodb

```
mongod --config /usr/local/etc/mongod.conf
```

**NOTE:** You will have to manually start mongodb after each restart.

You can optionally set mongodb to run at login time by typing the following:

```
ln -sfv /usr/local/opt/mongodb/*.plist ~/Library/LaunchAgents
```

Then to launch mongodb now type the following (this will not have to be typed after restarting):

```
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mongodb.plist
```


### Client Setup

```
$ cd client
$ npm install
$ bower install
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

To start the server, run the following from inside the server folder

```
$ npm start
```

