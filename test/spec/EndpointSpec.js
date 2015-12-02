'use strict'

var test = require('tape')
  , abitof = require('../..')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages
  , Origin = require('../..').Origin
  , Endpoint = require('../..').Endpoint

// refs for our timeouts
var timeouts = []

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

// tests --------------------------------------------------------

function EndpointSpecs () {

  test('Endpoint should be created with proper defaults', (t) => {
    var e = new Endpoint()
    t.equal(e.inputs, null, 'inputs is null')
    t.equal(e.outputs, null, 'ouputs is null')
    t.equal(e.downstream, null, 'downstream is null')
    t.equal(e.upstream, null, 'upstream is null')
    t.equal(e.handles, null, 'handles is null')
    t.equal(typeof(e.update), 'function', 'has a method update')
    t.equal(typeof(e.propogate), 'function', 'has a method propogate')
    t.notOk(e.attach, 'has no method attach')
    t.end()
  })

  test('should be able to attach an origin', (t) => {
    var o = makeOneOrigin()
    var r = makeSpyEndpoint()
    var e = r.endpoint
    // attach origin to endpoint
    o.attach(e)
    r.spy.on('value', (v) => {
      t.equal(v, 1, 'should get values from upstream')
      r.spy.removeAllListeners('value')
      t.end()
    })
  })

  test('should be able to swap upsteram\'s function', (t) => {
    var o = makeOneOrigin()
    var r = makeSpyEndpoint()
    var e = r.endpoint
    o.attach(e)
    r.spy.on('value', (v) => {
      t.equal(v, 1, 'should get values from first upstream')
      r.spy.removeAllListeners('value')
      // now let's swap origin function
      o.update(twoOriginFn)
      // now we should see 2's from our Endpoint
      r.spy.on('value', (v) => {
        t.equal(v, 2, 'should get new values from updated upstream')
        r.spy.removeAllListeners('value')
        t.end()
      })
    })
  })

  test('should be able to swap Endpoint\'s function', (t) => {
    var o = makeOneOrigin()
    var r = makeSpyEndpoint()
    var e = r.endpoint
    o.attach(e)
    r.spy.on('value', (v) => {
      t.equal(v, 1, 'should get values from first upstream')
      r.spy.removeAllListeners('value')
      // now let's swap endpoint function
      var newSpy = new EventEmitter()
      var newF = makeEndpointFn(newSpy)
      e.update(newF)
      newSpy.on('value', (v) => {
        t.equal(v, 1, 'got value from updated endpoint fn')
        newSpy.removeAllListeners('value')
        t.end()
      })
    })
  })

  test.skip('shouldn\'t be able to attach anything to an endpoint')

  // cleanup tests -----------------------------------------------

  test('cleanup', function (t) {
    t.plan(1)
    timeouts.forEach((t) => clearTimeout(t))
    t.ok(true, 'cleaned up')
  })


}

module.exports = EndpointSpecs