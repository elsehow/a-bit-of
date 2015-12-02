var EventEmitter = require('events').EventEmitter
  , Kefir = require('kefir')
  , Origin = require('../..').Origin
  , Transform = require('../..').Transform
  , Endpoint = require('../..').Endpoint

function cleanup (test) {
  test('cleaning up', (t) => {
    t.end()
    process.exit(0)
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

function oneStream () {
  var oneEmitter = new EventEmitter()
  var t = setInterval(() => oneEmitter.emit('number', 1), 1)
  return Kefir.fromEvents(oneEmitter, 'number')
}

// a simple origin  - a stream of 1s

function makeOneOrigin () {
  return new Origin().update(function () {
    // make an event emitter
    var oneEmitter = new EventEmitter()
    var t = setInterval(() => oneEmitter.emit('number', 1), 1)
    // return value conforms to the producer API
    return [
      [ oneEmitter, 'number' ]
    ]
  })
}

// returns an origin function
function makeTwoOriginFn () {
  // returns a function with an emitters of 2's
  return () => {
    // make an event emitter
    var twoEmitter = new EventEmitter()
    var t = setInterval(() => twoEmitter.emit('number', 2), 1)
    // return value conforms to the producer API
    return [
      [ twoEmitter, 'number' ]
    ]
  }
}

// an endpoint function. we're keeping it simple
function makeEndpointFn (emitter) {
  return () => {
    return [
      (x) => {
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
  var mySpyEndpoint = new Endpoint().update(makeEndpointFn(spy))
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
  return new Transform().update(timesTwoTransformFn)
}


// three-stream helpers

// returns an origin with two streams
// one of 1s
// one of 2s
function twoStreamOrigin () {
  return new Origin().update(function () {
    // make an event emitter
    var oneEmitter = new EventEmitter()
    var twoEmitter = new EventEmitter()
    setInterval(() => oneEmitter.emit('number', 1), 1)
    setInterval(() => twoEmitter.emit('number', 2), 1)
    // return value conforms to the producer API
    return [
      [ oneEmitter, 'number' ],
      [ twoEmitter, 'number' ],
    ]
  })
}

// returns a transform that processes 2 streams
// turns them into 3 streams
// last 2 are identical, but will go to different endpoints
function threeStreamTransform () {
  return new Transform().update(function (s1, s2) {
    return [
      s1.map((x) => x),
      s2.map((x) => x*2),
      s2.map((x) => x*3),
    ]
  })
}

// returns {endpoint, spy1, spy2, spy3}
// each spy is an emitter that returns a 'value' event
function makeThreeSpyEndpoint () {
  // setup 3 event emitters
  var spy1 = new EventEmitter()
  var spy2 = new EventEmitter()
  var spy3 = new EventEmitter()
  // an endpoint with three handles
  var endpoint = new Endpoint().update(function () {
    return [
      function (x) {
        spy1.emit('value', x)
      },
      function (x) {
        spy2.emit('value', x)
      },
      function (x) {
        spy3.emit('value', x)
      },
    ]
  })
  return {
    endpoint: endpoint,
    spy1: spy1,
    spy2: spy2,
    spy3: spy3,
  }
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
  // three-stream
  twoStreamOrigin: twoStreamOrigin,
  threeStreamTransform: threeStreamTransform,
  makeThreeSpyEndpoint: makeThreeSpyEndpoint,
}