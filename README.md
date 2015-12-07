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
  // we want to make a stream of its 'data' events
  return [
    [port, 'data']
  ]
}

var o = new abitof.Origin(e => 
  console.log('err', e)).update(originFn)
```

### transform

transform function's take streams, and return streams

```javascript
function transformFn (deviceStream) {
  // return a stream of fft'd buffers 
  return deviceStream.bufferWithCount(512).map(fft)
}

var t = new abitof.Transform(e => 
  console.log('err', e).update(trasnformFn)
```


### endpoints 

endpoint functions take streams, and return a list of functions.

the functions handles values from each input stream

```javascript
function endpointFn (fftStream) {
  //  endpoints setup logic
  midiServer.start()
  // return handle(), and, optionally, a taredown () function
  return [
    function (x) { 
      midiServer.send(midiFromAlphaWaves(x))
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
