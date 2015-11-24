# a-bit-of

live-coding with FRP & arduino-/procsesing-inspired scripts

![npm badge](https://nodei.co/npm/a-bit-of.png?downloads=true)

## introduction

live coding is [really great](http://toplap.org/bricolage-the-world-of-live-coding/)

long history in lisp and all that, still a core priority in clojure and clojurescript

especially with streaming, asynchronous sources of data, like sensors or websockets

a-bit-of helps you live-code with [EventEmitters](http://www.sitepoint.com/nodejs-events-and-eventemitter/) using sketches similar to those found in [Processing](https://processing.org/) and [Arduino](https://www.arduino.cc/).

you'll be able to save your scripts, updating the runtime without interrupting the stream of events from your event emitters

## usage

write a script.js file you to live-code:

```javascript

var kefir = require('kefir')

function setup () {

  // here's a simple emitter
  // it will count up
  // emitting a 'new-number' event every 30 ms
  var myEmitter = new EventEmitter()
  var n = 0
  setInterval(function () {
    n+=1; myEmitter.emit('new-number', n)
  }, 30)

  return [
    {
      em: myEmitter,
      ev: 'new-number',
      fn: function (emitter, evnt) {
        return Kefir.fromEvents(emitter, evnt)
      }
    }
  ]
  
}

// our process fn will take that stream
function process (emitter) {

  emitter.on('new-number', function (x) {
    console.log(x*2)
  })
}

module.exports = {
  setup: setup,
  process: process
}

```

now, set that script up with a-bit-of:

```javascript
var  path = require('path')
  , abitof = require('abitof')

// run this, and live-code script.js!!

// `charm` em with app.js
var script = path.join(__dirname, '/script.js')
// make sure to pass an absolute path
abitof(script)
```

`node` that latter file to run it, and start editing the process() function in script.js!

when you save your changes, the script will self-update right away.

try making a syntax error. notice how it doesn't crash stuff!

## event emitters?

in javascript, event emitters are at the core of most asynchronous operations. i personally deal with streaming biosensor data, which sometimes comes over a bluetooth connection (serial) and sometimes through a websocket. in both cases, i need to parse and process the data.

anything that looks like this is an event emitter:

```javascript
foo.on('bar', function () {
  //...
})
```

one example might be a [Socket.io](http://socket.io) connection. then you might have:

```javascript
socket.on('my-data-event', function (data) {
  // ..
})
```

[node streams](https://github.com/substack/stream-handbook) have EventEmitters, too:

```javascript
process.stdout.on('data', function (data) {
  // ..
})
```

so do [serialport](https://www.npmjs.com/package/serialport)s, etc..

a-bit-of lets you **live-code** with any EventEmitter - i.e. anything that conforms to this basic `foo.on('bar', function () {..})` pattern.

## live coding?

yes! a-bit-of uses [hotmop](http://github.com/elsehow/hotmop) to live-reload your code, hotswapping the new version for the old one, whenever your file changes.

**LIVE-RELOADING WILL ONLY WORK FOR YOUR PROCESS() FUNCTION!**

see how they above example has a process() and a setup() function? setup() is run once - it connects to your sources of streaming data. _changes to process() will auto-refresh without interrupting the data streams you connected to in setup()_

# api

## abitof(appPath)

load a user script for live-reloading:

```javascript
abitof('/home/elsehow/my-script.js')
```

takes an absolute path to a user script file.

see below for format of the user script.

## user script structure

user scripts export 2 functions: setup() and process()

setup() functions send arguments to process().

process() sets up listeners that deal with the data that comes over the event emitters.

a `module.exports` statement can expose these two functions:

```javascript
var abitof = require('a-bit-of')

function setup () { 
  var port = // setup serial port..
  return [
    {
      em: port
      ev: 'data'
      fn: function (em, ev) {
        return em
      }
    }
  ]
}

function process (port) { 
 // do stuff to `port`
}

module.exports = {
  setup: setup,
  process: process
}
```

### setup()

setup() is responsible for connecting to your sources of streaming data

it gets run once - while changes to process() will get live reloaded, changes to setup() will not. this assures that your data keeps flowing without interruption, and without the need to reconnect on code changes

```javascript
function setup () { 
  var port = // setup serial port..
  var socket = // setup websocket port..
  function passEmitter (em, ev) {
    return em
  }
  return [
    { em: port, ev: 'data', fn: passEmitter },
    { em: socket, ev: 'my-socket-event', fn: passEmitter }
  ]
}

function process (serialPort, websocket) {
  // do stuff with my two emitters...
}

```

the return value of setup() is a list of objects `{ em, ev, fn }`, where `em` is an event emitter, `ev` is an event (string), and `fn` is a function that also takes an emitter and an event. 

the values in this list will turn into arguments to process(). specifically, for each object of `{ em, ev, fn }`, we take the result of `fn(em, ev)` and pass it as an argument to process.

it's recommended that you wite helper functions for this. use examples/kefir.js as a template.

### process (args...)

process() sets up ways to process your streaming data

process() gets its arguemnt from the return value of setup().

**saving changes to process() while your script is running will live-reload the changes without interrupting your data streams**

```javascript
var abitof = require('abitof')
 , io = require('socket.io-client')
 , serialport = require('serialport').SerialPort
 , Kefir = require('kefir')
 , makeStream = function (em, ev) { return Kefir.fromEvents(em, ev) }

function setup () {
  var port = new SerialPort('/dev/tty.MindWave')
  var socket = io('my-socket-server')
  return [
    makeStream(port, 'data'),
    makeStream(socket, 'data'),
  ]
}

function process (serialPortStream, websocketStream) {
  // do stuff ...
}
```

## returning values from process

when we're setting up a-bit-of, we do:

```javascript
abitof(pathToScript)
```

well, `abitof` returns an event emitter:

```javascript
// load the script for live-reloading
var emitter = abitof(pathToScript)
// handle return values from script's process() fn
emitter.on('return-value', function (v) {
  console.log('process() function just changed! it returned', v)
})
//handle errors
emitter.on('error', function (err) {
  console.log('some error!')
})

```

one 'return-value' event will be returned every time the user-script is re-loaded!

# examples

## simple-example

    cd examples/simple-example
    node simple-example.js

now, make changes to process() in script.js

save your changes

and notice how everything live-reloads neatly!

try putting a syntax error in script.js, and save that.

notice how it doesn't crash! 

it will patiently wait for you to fix the changes.

meanwhile, your event emitters are still pumping events out, undisturbed!

**NOTE**: if you change `process()`, it will live-reload without running setup again. so, you will not have to re-connect to websocket servers, re-open serial ports, etc... on changes. hooray! *HOWEVER* - if you change `setup()`, everything will get reloaded!

## multiple-streams

    cd examples/multiple-streams
    node multiple-streams.js

and live-code script.js

notice how we're passing multiple streams to process()

notice also how process() returns a stream, which we get back in multiple-streams.js

## trivia

this package is named after [a bit of fry and laurie](https://en.wikipedia.org/wiki/A_Bit_of_Fry_%26_Laurie), an oblique reference to Ben Fry & Casey Raes, the developers of Processing language, from which i took inspiration for the format of user scripts.

## license

BSD-2-Clause
