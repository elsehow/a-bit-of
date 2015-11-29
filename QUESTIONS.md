
- are the swap() functions synchronous or asynchronous? which **should** they be?

- what are the pros and cons of supporting multiple input/output streams?

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

seems intimately tied to the question of how multiple streams are, or are not, passed between producers/transforms/consumers

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

- consumer: return [,]...

- producer: returns stream

- consumer: returns function / object of functions

- swap...(): input is a function that passes the appropriate test, above

## what language are we using here?

### functions

producer

transform

consumer

### meta-level

component - any one of the above function types

user input - all the functions above, collectively