# easy charm

live-code with event emitters

**note** i recommend you use the higher-level package i wrote [simple-charm](http://github.com/elsehow/simple-charm), which uses Kefir (FRP) streams.

## installation

    npm install easy-charm

## developing 

if you're developing this package, or running from the repository, 

    npm install --dev

## usage:

in one file (index.js):

```javascript
var charm = require('easy-charm')
  , spawn = require('child_process').spawn
  , Kefir = require('kefir')

function pathTo (filename) { 
  return require('path').join(__dirname, filename)
}

// one-script prints 1 to process.stdout, over and over
var process  = spawn('node', [pathTo('one-script.js')])

// `charm` em with app.js
var app = pathTo('/app.js')
// make sure to pass an absolute path
charm(app, process.stdout, 'data', function (emitter, ev) {
  return Kefir.fromEvents(emitter, event) 
})
```

in another file (app.js):
 
```javascript
module.exports = function (kefirStream) {
  function addTwo (x) { return x+2 }
  var threeStream = kefirStream.map(addTwo)
  threeStream.log()
}
```

now you can `node index.js` and, while it's running, live-code app.js!

## how it works / what is going on 

every time you save app.js, we remove all the listeners will be removed from your emitter's event. 

then, we apply the function (that last arugment) to each emitter and event pair passed in. this function returns something - whatever that something is, we pass it into the function exposed by app.js

finally, we [hot-swap](http://npmjs.com/package/hotmop) the old function for the newly-saved one 

see examples/ for working with multiple event emitters, returning stuff back to index.js (e.g. for logging), etc.

## api

single stream:

### charm(path, emitter, event, fn)

or multiple streams:

### charm(path, [emitter, event], [emitter2, event2], ..., fn)

**PATH**

path refers to some file that exposes a function.
the arguments to this function will be Kefir streams, 

**FN**

this function gets applied
every time you save changes to app.js.
whatever this function returns, will
be returned to the function exposed by app.js,
 one for each `[emitter, event]` pair passed to charm.

see examples/multiple-streams/ for an example with multiple in-streams

**RETURN VALUES**

`charm` returns an event emitter - this emitter returns two kinds of events:

* **'return-val'**  - this event will emit every time the app file is saved. it will contain the return value of the app's function. see examples

* **'error'**  - this event will emit every time there was an error reloading/hot-swapping the function. these will often be syntax errors. you can catch these without crashing your whole app! all listeners will be unsubscribed from emitters when this happens.

example: in index.js, you can:

    // setup charm on some file path `appPath`
    var emitter = charm(appPath, socket, 'event')
    // get new return values every time app is hotswapped
    emitter.on('return-val', function (r) {
      // do stuff with `app`'s return value
    })
    // catch reload errors
    emitter.on('error', function (err) {
      console.log('ERR!!!', err)
    })
  

see examples/logging/ for one use case of this

## why

livecoding is [really great](http://toplap.org/bricolage-the-world-of-live-coding/)

long history in lisp and all that, still a core priority in clojure and clojurescript

in javascript, event emitters are at the core of most asynchronous operations. i personally deal with streaming biosensor data, which sometimes comes over a bluetooth connection (serial) and sometimes through a websocket. in both cases, i need to parse and process the data. 

you can use this to mix-and-match various types of emitters - [sockets](https://github.com/maxogden/websocket-stream), [serial connections](https://www.npmjs.com/package/serialport2), [any node stream](https://github.com/substack/stream-handbook), what have you

personally i use this with kefir streams - [simple-charm](http://github.com/elsehow/simple-charm) is a very light wrapper on this package

## debugging

be sure to pass `charm` the absolute path of your script. see example.

## LICENSE

BSD-2-Clause

