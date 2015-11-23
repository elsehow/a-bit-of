# a-bit-of

a bit of fry & raes

live-coding with FRP & arduino-/procsesing-inspired scripts

**NOTE**: this is under development. not finished!!

[npm badge]()

## introduction

live coding is really great

especially with streaming, asynchronous sources of data, like sensors or websockets

a-bit-of helps you turn events from [EventEmitters]() into [Kefir streams](), a data structure that lets you perform operations on values over time (e.g. `map`, `filter`, `throttle`, `buffer`, etc).

don't like Kefir streams? thats ok - you can turn the event emitters into whatever you'd like. see [API - setup()](## setup()) examples/custom-types

## usage

index.js:

```javascript
var  path = require('path')
  , abitof = require('../..')

// run this, and live-code script.js!!

// `charm` em with app.js
var script = path.join(__dirname, '/script.js')
// make sure to pass an absolute path
abitof.running(script)
```

now, write a script.js for you to live-code:

```javascript
var charm = require('abitof').charm

function setup () {

  // here's a simple emitter
  // it will emit a 'new-number' event every 30 ms
  var myEmitter = new EventEmitter()
  var n = 0
  setInterval(function () {
    n+=1; myEmitter.emit('new-number', n)
  }, 30)

  return {
    args: [{
      emitter: myEmitter,
      ev: 'new-number'
    }]
  }
  
}

// our process fn will take that stream
function process (stream) {

  function timesTwo (x) { return x*2 }

  stream.map(timesTwo).log()

}

module.exports = {
  setup: setup,
  process: process
}

```

# api

user scripts export 2 functions: setup() and process()

setup() functions send arguments to process().

process() sets up listeners that deal with the data that comes over the event emitters.

## script files

scripts should export 2 functions: `setup` and `process`

so, at the end of every script file, a `module.exports` statement can expose these:

```javascript

// function setup () { 
//  ...
// }

// function process () { 
//  ...
// }

module.exports = {
  setup: setup,
  process: process
}
```

## setup ()

setup() functions pass data into process() functions

we do this by a special syntax. (if you're wondering why this syntax looks like this, see [What's Going On?](#what's going on?)

here's an example of how to structure return values for `setup()` functions 

```javascript
function setup () {

  // do stuff ...

  return {
    args: [
      {
        emitter: myEmitter,
        ev: 'some-event',
      {
    ], 
    fn: function (em, ev) {
      return Kefir.fromEvents(em, ev)
    }
  }
}
```

`args` is a list of objects with keys `{emitter, event}`. `emitter` is an [EventEmitter](), and `ev` is a string.

`fn` gets applied to every event in `args`.

the result of executing `fn` on each event in `args` is what gets passed to the process() function

notice how, in the above examples, we didn't specify `fn`, and we got a Kefir stream in process(). the `fn` listed above is the default value - if you don't specify `fn`, that's what gets executed.

overwriting `fn` is recommended if you'd like to work with:

- Rx observables
- raw event emitters
- some other FRP library
- etc...

## process (args...)

the process() function takes the results of executing your setup's `fn` on each `{emitter, event}` object in your setup's `args`

```javascript
function setup () {
  // ...
  return {
    args: [
      {
        emitter: emitter1, 
        ev: 'event1'
      },
      {
        emitter: emitter2, 
        ev: 'event2'
      },
    ],
    fn: function (em, ev) {
      return Kefir.fromEvents(em, ev)
    }
  }
}

function process (stream1, stream2) {
  // do stuff ...
}
```
so, the length of your setup() function's `args` return value

dictates the number of arguments that get fed to `process`

the function `fn` in your setup()'s return type

dictates the types of the arguments fed to process()

## event emitters 

one example might be a [Socket.io]() connection. then you might have:

  {
    emitter: socket,
    event: 'my-websocket-event'
  }

[node streams]() have EventEmitters, too:

  { 
    emitter: process.stdout,
    event: 'data'
  }

so do [serialport]()s, etc..


### returning values from process

when we're setting up a-bit-of, we do:

  abitof.running(pathToScript)

well, this function returns an event emitter:

  // load the script for live-reloading
  var emitter = abitof.running(pathToScript)
  // handle return values from script's process() fn
  emitter.on('return-value', function (v) {
    console.log('process() function just changed! it returned', v)
  })

one 'return-value' event will be returned every time the process() function is modified in the script

# examples

## simple-example

go into this directory and

    node simple-example.js

now, edit the `process()` function in script.js.

save your changes

and notice how everything live-reloads neatly!

try putting a syntax error in script.js, and save that.

notice how it doesn't crash! 

it will patiently wait for you to fix the changes.

meanwhile, your event emitters are still pumping events out, undisturbed!

**NOTE**: if you change `process()`, it will live-reload without running setup again. so, you will not have to re-connect to websocket servers, re-open serial ports, etc... on changes. hooray! *HOWEVER* - if you change `setup()`, everything will get reloaded!

## multiple-streams

here,

    node multiple-streams.js

and live-code script.js

TODO add more

