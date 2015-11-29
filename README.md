# a bit of

## user inputs

the user inputs 3 functions

these functions, in order, are

### producer

takes nothing

returns [ emitter, 'event' ]

```javascript
function producer () {
  // port is an EventEmitter
  port = serialport('/dev/tty.MindWave')
  // we want to make a stream of its 'data' events
  return [port, 'data']
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

### consumer

takes a stream 

TODO: handle values from multiple streams ?

returns {
  handle: function (x) { // handle each value of input stream },
  taredown: function () { // do stuff to the stream }
}

```javascript
function consumer (fftStream) {
  // consumer setup logic
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

### swapProducer(producerFunction)

### swapTransform(transformFunction)

### swapConsumer(consumerFunction)


