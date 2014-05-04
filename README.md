72 Fest App
===========


#Requirements

* nodejs
* mysql

## Setup

To get started, you need to grab all dependencies for the client and server.


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

