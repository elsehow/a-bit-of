'use strict'

var test = require('tape')
  , abitof = require('../..')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages
  , Origin = require('../..').Origin
  , Transform = require('../..').Transform
  , Endpoint = require('../..').Endpoint

// our consumer function emits 'value' events through this emitter
var outputEmitter = new EventEmitter()

// refs for our timeouts
var timeouts = []

// TODO
// ALL components should get some prototypical methods..
// - attach to a downstream
// - attach to an upstream
// - validate downstream
// - validate upstream

//  testing equipment --------------------------------------------------

// a simple origin  - a stream of 1s
function makeOneOrigin () {
  return new Origin(function originFn () {
    // make an event emitter
    var oneEmitter = new EventEmitter()
    var t = setInterval(() => oneEmitter.emit('number', 1), 300)
    timeouts.push(t)
    // return value conforms to the producer API
    return [
      [ oneEmitter, 'number' ]
    ]
  })
}


function twoOriginFn () {
  // make an event emitter
  var twoEmitter = new EventEmitter()
  var t = setTimeout(() => twoEmitter.emit('number', 2), 300)
  timeouts.push(t)
  // return value conforms to the producer API
  return [
    [ twoEmitter, 'number' ]
  ]
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


// returns { endpoint, spy }
function makeSpyEndpoint () {
  // we use this to see what's going on inside the endpoint
  var spy = new EventEmitter()
  // an endpoint function. we're keeping it simple
  function endpointFn () {
    return [
      function (x) {
        spy.emit('value', x)
      }
    ]
  }
  // returns { endpoint, spy }
  return {
    endpoint: new Endpoint(endpointFn),
    spy: spy
  }
}

// tests --------------------------------------------------------

function TransformSpecs () {

  test('Transform should initialize with proper defaults', function (t) {
    var o = new abitof.Transform(timesTwoTransform)
    t.equal(typeof(o.update), 'function', 'update is a fn')
    t.equal(o.downstream, null, 'downstream == null')
    t.equal(o.upstream, null, 'upstream == null')
    t.end()
  })

  test('should be able to attach a downstream and an upstream', function (t) {
    var r = makeSpyEndpoint()
    // we'll use this event emitter to spy on output from Origin
    var spy = r.spy
    // now we should see a 2 come out of our spy in the downstream
    spy.on('value', (v) => {
      t.equal(v, 2, 'we get values from attaching a downstream to an origin.')
      spy.removeAllListeners('value')
      t.end()
    })
    // attach the 1-emitting origin to our transform
    var oneOrigin = makeOneOrigin()
    // make a new transform
    var o = new Transform(timesTwoTransform)
    // attach origin to transform, transform to downstream
    oneOrigin.attach(o).attach(r.endpoint)
    t.notOk(o.error, 'should be no error after attaching to downstream')
    t.equal(o.downstream, r.endpoint, 'downstream should have attached.')
  })

  test('should be able to swap upstream functions', function (t) {
    var r = makeSpyEndpoint()
    // we'll use this event emitter to spy on output from Origin
    var spy = r.spy
    // now we should see a 2 come out of our spy in the downstream
    spy.on('value', (v) => {
      t.equal(v, 2, 'we get values from attaching a downstream to an origin.')
      spy.removeAllListeners('value')
      // once we do, 
      // let's swap origin for a function that emits a stream of 2's
      oneOrigin.update(twoOriginFn)
      // now we should see a 4 come out of our spy in the downstream
      // now we should see a 2 come out of our spy in the downstream
      spy.on('value', (v) => {
        t.equal(v, 4, 'we get the updated upstream\'s values downstream.')
        spy.removeAllListeners('value')
        t.end()
      })
    })
    // attach the 1-emitting origin to our transform
    var oneOrigin = makeOneOrigin()
    // make a new transform
    var o = new Transform(timesTwoTransform)
    // attach origin to transform, transform to downstream
    oneOrigin.attach(o).attach(r.endpoint)
    t.notOk(o.error, 'should be no error after attaching to downstream')
    t.equal(o.downstream, r.endpoint, 'downstream should have attached.')
  })

  test('should be able to swap transform\'s functions', function (t) {
    var r = makeSpyEndpoint()
    // we'll use this event emitter to spy on output from Origin
    var spy = r.spy
    // make a new transform
    var o = new Transform(timesTwoTransform)
    // now we should see a 2 come out of our spy in the downstream
    spy.on('value', (v) => {
      spy.removeAllListeners('value')
      t.equal(v, 2, 'we get values from origin->transform->endpoint.')
      // once we do, 
      // let's swap our transform function for something else
      o.update(timesThreeTransform)
      // now we attach a new listener, expecting 3's from our updated function
      spy.on('value', (v) => {
        t.equal(v, 3, 'see new values at endpoint after updating transform.')
        t.end()
        spy.removeAllListeners('value')
      })
    })
    // attach the 1-emitting origin to our transform
    var oneOrigin = makeOneOrigin()
    // attach origin to transform, transform to downstream
    oneOrigin.attach(o).attach(r.endpoint)
    t.notOk(o.error, 'no error attaching downstream')
    t.equal(o.downstream, r.endpoint, 'downstream should have attached.')
  })



  // tests for validation ----------------------------------------

  // cleanup tests -----------------------------------------------
  test('cleanup', function (t) {
    t.plan(1)
    timeouts.forEach((t) => clearTimeout(t))
    t.ok(true, 'cleaned up')
  })

}

module.exports = TransformSpecs



