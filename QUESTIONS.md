
- are the swap() functions synchronous or asynchronous? which **should** they be?

- what are the pros and cons of supporting multiple input/output streams?

- how would multiple streams work?

- are we describing a DAG? do we want that to be clear from the API?

- consumers are being passed a stream....but not using them. this is weird, no? how can we deal with this

- consumers should definitely have handle() and taredown(). but, taredown() isn't **always** needed. can we simplify the api? pros/cons?

- whats the minimum we need to do to parse inputs?

- what language are we using here?




ANSWERS

## are the swap() functions synchronous or asynchronous? which **should** they be?

## what are the pros and cons of supporting multiple input/output streams?

CONS
- potentially confusing for newbies
- sometimes return vals would have to be arrays (confusing for everyone)

PROS
- can transform by combining streams!
- can graph multiple streams at once!

## how would multiple streams work? 

instinct is -

take and return streams.........in order
'

```javascript

function origin ()  {
  return [
    charm.stream(emitter1, 'data'),
    charm.stream(emitter2, 'data'),
  ] 
}

// WEIRD: how did these become streams?
function transform (stream1, stream2) {
  return [
    stream1.map(fn1),
    stream2.map(fn2),
  ]
}

// WEIRD: stream1 and stream2 still dont appear in the function body
function consumer (stream1, stream2) {
  return {
    setup: function () {
      // do setup stuff
    }
    processes: [
      function (x) { handleStream1Val(x) },
      function (x) { handleStream2Val(x) },
    ],
    taredown: function () {
      // do taredown stuff
    }
  }

}


```

now.......that is GREAT if we dont mind our functions doing more than one thing.......BUT, if we restart our neurosky, we dont necessarily want to restart our myo........u feel me? 

if a prdoucer splits a stream, THAT is fine/good. anything can output multiple streams AND anything can take multiple streams

............but..............there should be a way for my myo and my mindwave to get processed totally in parallel (so easy to imagine in max/msp land)

but in js???

dont worry.
the idea is,
allow multiple inputs/outputs across the aboard.
coordinating multiple origins    (&consumers&transforms)... worry abt it later
1st just 1 string




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

seems intimately tied to the question of how multiple streams are, or are not, passed between origins/transforms/consumers

## consumers should definitely have handle() and taredown(). but, taredown() isn't **always** needed. can we simplify the api? pros/cons

one approach:

```javascript
function consumer (stream) {
  // setup
  return function (x) {
    // do stuff to each value
  }
}
```

then, someone can return `{ handle, taredown }`, if they are pro.

not bad. but, `stream` still isn't referenced, which is annyoing. see above.

## whats the minimum we need to do to parse inputs?

now, this is all highly dependent on what happens wrt the above questions

current answer:

- origin: return [,]...

- transform: takes stream, returns stream

- consumer: returns function / object of functions

- swap...(): input is a function that passes the appropriate test, above

## what language are we using here?

### functions

origin    (emphasizes its the 'source' of the streams
formerly: producer 

transform

consumer
endpoint

### meta-level

component - any one of the above function types

user input - all the functions above, collectively