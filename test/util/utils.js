var EventEmitter = require('events').EventEmitter
  , Kefir = require('kefir')
  , Origin = require('../..').Origin
  , Transform = require('../..').Transform
  , Endpoint = require('../..').Endpoint

function cleanup (test, timeouts) {
  test('cleaning up', (t) => {
    timeouts.forEach((t) => clearInterval(t))
    t.end()
  })
}

// verify that a stream is emitting the values you think it is
function verifyStream (t, stream, val, comment, cb) {
  function checkVal (v) {
    t.deepEqual(v, val, comment)
    stream.offValue(checkVal)
    cb()
  }
  stream.onValue(checkVal)
}

function oneStream (timeouts) {
  var oneEmitter = new EventEmitter()
  var t = setInterval(() => oneEmitter.emit('number', 1), 1)
  timeouts.push(t)
  return Kefir.fromEvents(oneEmitter, 'number')
}

// a simple origin  - a stream of 1s

function makeOneOrigin (timeouts) {
  return new Origin(function () {
    // make an event emitter
    var oneEmitter = new EventEmitter()
    var t = setInterval(() => oneEmitter.emit('number', 1), 1)
    timeouts.push(t)
    // return value conforms to the producer API
    return [
      [ oneEmitter, 'number' ]
    ]
  })
}

// returns an origin function
function makeTwoOriginFn (timeouts) {
  // returns a function with an emitters of 2's
  return () => {
    // make an event emitter
    var twoEmitter = new EventEmitter()
    var t = setInterval(() => twoEmitter.emit('number', 2), 1)
    timeouts.push(t)
    // return value conforms to the producer API
    return [
      [ twoEmitter, 'number' ]
    ]
  }
}

// an endpoint function. we're keeping it simple
function makeEndpointFn (emitter) {
  return function () {
    return [
      function (x) {
        emitter.emit('value', x)
      }
    ]
  }
}

// returns { endpoint, spy }
function makeSpyEndpoint () {
  // we use this to see what's going on inside the endpoint
  var spy = new EventEmitter()
  // make our endpoint
  var mySpyEndpoint = new Endpoint(makeEndpointFn(spy))
  // returns { endpoint, spy }
  return {
    endpoint: mySpyEndpoint,
    spy: spy
  }
}

// 1 simple transform fn
function timesTwoTransformFn (stream) {
  return [
    stream.map((x) => x*2)
  ]
}

// another simple transform fn
function timesThreeTransformFn (stream) {
  return [
    stream.map((x) => x*3)
  ]
}

function makeTimesTwoTransform () {
  return new Transform(timesTwoTransformFn)
}



module.exports = {
  // basic
  oneStream: oneStream,
  verifyStream: verifyStream,
  cleanup: cleanup,
  // origins
  makeTwoOriginFn: makeTwoOriginFn,
  makeOneOrigin: makeOneOrigin,
  // transforms
  timesTwoTransformFn: timesTwoTransformFn,
  timesThreeTransformFn: timesThreeTransformFn,
  makeTimesTwoTransform: makeTimesTwoTransform,
  //endpoints
  makeEndpointFn: makeEndpointFn,
  makeSpyEndpoint: makeSpyEndpoint,
}