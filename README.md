# a bit of

work in progress.

for something stable, but outdated, refer to [the old npm package](https://www.npmjs.com/package/a-bit-of)

## user inputs

the user inputs 3 functions

these functions, in order, are

### origin

takes nothing

returns [ emitter, 'event' ]

```javascript
function origin () {
  // port is an EventEmitter
  port = serialport('/dev/tty.MindWave')
  // we want to make a stream of its 'data' events
  return [
    [port, 'data']
  ]
}
```

### transform

takes a stream, returns a stream

TODO: multiple streams ?

```javascript
function transform (mindwaveStream) {
  // return a stream of fft'd buffers 
  return mindwaveStream.bufferWithCount(512).map(fft)
}
```

### endpoints 

takes a stream 

TODO: handle values from multiple streams ?

returns {
  handle: function (x) { // handle each value of input stream },
  taredown: function () { // do stuff to the stream }
}

```javascript
function endpoint (fftStream) {
  //  endpoints setup logic
  midiServer.start()
  // return handle(), and, optionally, a taredown () function
  return {
    handle: function (x) { 
      midiServer.send(midiFromAlphaWaves(x))
    },
    taredown: function () {
      midiServer.stop()
    }
  } 
}
```


## api

### swapOrigin(originFunction)

### swapTransform(transformFunction)

### swapEndpoints(endpointsFunction)


