'use strict'

var test = require('tape')
  , utils = require('../util/utils.js')
  , Component = require('../../src/Component')
  , Endpoint = require('../..').Endpoint

// refs for our timeouts
var timeouts = []

// tests --------------------------------------------------------

function EndpointSpecs () {

  test('%%%% ENDPOINT SPEC %%%%', (t) => t.end())

  test('Endpoint should be created with proper defaults', (t) => {
    var e = new Endpoint()
    t.equal(e._handlers, null, '_handlers is null')
    e = utils.makeSpyEndpoint().endpoint
    t.equal(typeof(e._handlers[0]), 'function', '_handlers is a list of functions')
    t.deepEqual(e._handlers.toString(), e._fn().toString(), '_handlers are properly applied from input fn') 
    t.end()
  })

  test('shouldn\'t be able to attach anything to an endpoint', (t) => {
    t.plan(1)
    var upstreamErr = (err) => {
      console.log('error i expected to see', err)
      t.ok(err, 'upstream (endpoint) should emit an error.')
    }
    var downstreamErr = (err) => {
      t.notOk(err, 'should be no error from downstream')
    }
    var e = new Endpoint(upstreamErr)
    var c = new Component(downstreamErr)
    e.attach(c)
  })

  test('should trigger its function\'s taredown() methods, but only when that function is being changed to something else..', (t) => {
    t.plan(1)
    // an endpoint function with a taredown
    function withTaredown () {
      return {
        handlers: [
          () => null
        ],
        taredown: () => {
          t.ok(true, 'tearing down the function')
        }
      }
    } 
    // should NOT trigger taredown 
    var e = new Endpoint().update(withTaredown)
    // should NOT trigger taredown if a new fn is **not** passed in (e.g. on propogate downstream)
    e._takeFromUpstream([ utils.oneStream() ])
    var c = new Component()
    c._takeFromUpstream([ utils.oneStream() ])
    c.attach(e)
    c._takeFromUpstream([ utils.oneStream() ])
    // again, should  trigger taredown if a new fn is passed in
    var e = e.update(withTaredown)
  })

  test('endpoint functions should setup and taredown', (t) => {
    t.plan(3)
    var e = new Endpoint()
    // one test endpoint fn
    e.update(() => {
      // this should happen on setup
      t.ok(true, 'setting up')
      return {
        handlers: [ 
          // TODO - swap to a different endpoint fn to see how taredown works
          (x) => t.ok(x, 'this should happen on an event')
        ],
        // if we change the fn once,
        // we expect this to be called once
        taredown: () => {
          t.ok(true, 'taring down')
        }
      }
    })
    // try another endpoint fn
    e.update(() => {
      t.ok(true, 'setting up fn 2')
      return {
        handlers: [
          () => null
        ],
        // we don't swap out this function
        // so, we expect never to see this executed
        taredown: () => {
          t.notOk(true, 'fn 2 taredown() shouldn\'t be called')
        }
      }
    })
  })

  // tests for validation ----------------------------------------

  test('validates user input fn', (t) => {
    t.plan(3)
    // a higher-order function for making error handlers
    function checkError (msg) {
      return (err) => {
        console.log('an error i was expecting to see', err)
        t.ok(err, msg)
      }
    }
    var e = new Endpoint(checkError('errors correctly'))
    // bad fn 1
    e.update('not a function')
    // bad fn 2
    e.update(function () {
      return (x) => 'not a list'
    })
    // bad fn 3
    e.update(function () {
      return [
        'not a list of functions'
      ]
    })
    e.update(function () {
      return [
        () => 'this one should be fine - no error expected'
      ]
    })
  })

  // cleanup tests -----------------------------------------------

  test('cleanup', function (t) {
    t.plan(1)
    timeouts.forEach((t) => clearTimeout(t))
    t.ok(true, 'cleaned up')
  })


}

module.exports = EndpointSpecs
