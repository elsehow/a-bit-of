# a bit of

a functional-reactive approach to flow-based programming

make chains of functions, a-la max/msp, puredata, vvvv, etc, to program with streaming sources of data

update processing/output functions without disturbing your source streams.

## components

components are attached together to process streams.

components are made out of a function. general pattern:

```javascript
var c = new Component(e => 
  console.log('err', err)).update(myFunction)
```

the component's consturctor takes an error callback. you can set the component's function by calling its `update` method.

there are three types of components:

### origin

origin's functions take nothing

they reutrn a list of [ [ emitter, 'event' ] ..]

```javascript
function originFn () {
  // port is an EventEmitter
  port = serialport('/dev/tty.MindWave')
  socket = websocket('ws://some-server')
  // we want to make a stream of its 'data' events
  return [
    [port, 'data'],
    [socket, 'event'],
  ]
}

var o = new abitof.Origin(e => 
  console.log('err', e)).update(originFn)
```

### transform

transform function's take an arbitrary number of streams, and return a list of streams

```javascript
function transformFn (deviceStream, socketStream) {
  // return a stream of fft'd buffers 
  return [
    deviceStream.bufferWithCount(512).map(fft),
    socketStream.filter(someFilterFn),
  ]
}

var t = new abitof.Transform(e => 
  console.log('err', e).update(trasnformFn)
```


### endpoints 

endpoint functions return a list of functions.

the functions handle values from inputs stream

```javascript
function endpointFn (fftStream) {
  //  endpoints setup logic
  midiServer.start()
  // return handle(), and, optionally, a taredown () function
  return [
    function (x) { 
      midiServer.send(midiFromAlphaWaves(x));
      midiServer.send(midiFromRoomEvents(x));
    }
  ]
}

var e = new Endpoint (e => 
  console.log('err', e).update(endpointFn)
```

optionally, endpoint functions can return a `taredown()` method, which gets triggered when a new update() function is passed through

use it for, e.g., removing divs so that you can re-add them.

```javascript
function endpointFn (fftStream) {
  //  endpoints setup logic
  midiServer.start()
  // return handle(), and, optionally, a taredown () function
  return {
    handlers: [
      function (x) { 
        midiServer.send(midiFromAlphaWaves(x))
      }
    ],
    // taredown
    taredown: () => {
      midiServer.stop()
    }
}
```
## attaching components together

```javascript
var abitof = require('a-bit-of')

// make components
var o = new abitof.Origin(someOriginFn)
var t = new abitof.Transform(someTransformFn)
var e = new abitof.Endpoint(someEndpointFn)

// attach them together
o.attach(t).attach(e)
```

## api

### origin

update(originFn)

attach(someDownstreamComponent)

### transform

update(transformFn)

attach(someDownstreamComponent)

## endpoint

update(transformFn)

NOTE: you can't attach anything to endpoints. nothing can be downstream from an endpoint.
