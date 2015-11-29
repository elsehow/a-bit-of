
- are the swap() functions synchronous or asynchronous? which **should** they be?

- what are the pros and cons of supporting multiple input/output streams?

- are we describing a DAG? do we want that to be clear from the API?

- consumers are being passed a stream....but not using them. this is weird, no? how can we deal with this

- consumers should definitely have handle() and taredown(). but, taredown() isn't **always** needed. can we simplify the api? pros/cons?






ANSWERS

## are the swap() functions synchronous or asynchronous? which **should** they be?

## what are the pros and cons of supporting multiple input/output streams?

CONS
- potentially confusing for newbies
- sometimes return vals would have to be arrays (confusing for everyone)

PROS
- can transform by combining streams!
- can graph multiple streams at once!

## are we describing a DAG? do we want that to be clear from the API?

## consumers are being passed a stream....but not using them. this is weird, no? how can we deal with this

case in point:

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

(see how `fftStream` isn't referenced in consumer() function body)

yes, this is awkward/weird

## consumers should definitely have handle() and taredown(). but, taredown() isn't **always** needed. can we simplify the api? pros/cons

one approach:

```javascript
function consumer (stream) {
 
}
```

