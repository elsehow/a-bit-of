var EventEmitter = require('events').EventEmitter
  , Origin = require('../..').Origin
  , Endpoint = require('../..').Endpoint

// a simple origin  - a stream of 1s

function makeOneOrigin (timeouts) {
  return new Origin(function originFn () {
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
  return function () {
    // make an event emitter
    var twoEmitter = new EventEmitter()
    var t = setTimeout(() => twoEmitter.emit('number', 2), 1)
    timeouts.push(t)
    // return value conforms to the producer API
    return [
      [ twoEmitter, 'number' ]
    ]
  }
}

// an endpoint function. we're keeping it simple
function makeEndpointFn (emitter) {
  return function endpointFn () {
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
function timesTwoTransform (stream) {
  return [
    stream.map((x) => x*2)
  ]
}

// another simple transform fn
function timesThreeTransform (stream) {
  return [
    stream.map((x) => x*3)
  ]
}



module.exports = {
  makeTwoOriginFn: makeTwoOriginFn,
  makeOneOrigin: makeOneOrigin,
  // transforms
  timesTwoTransform: timesTwoTransform,
  timesThreeTransform: timesThreeTransform,
  //endpoints
  makeEndpointFn: makeEndpointFn,
  makeSpyEndpoint: makeSpyEndpoint,
}