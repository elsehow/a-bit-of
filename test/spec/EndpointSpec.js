'use strict'

var test = require('tape')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages
  , utils = require('../util/utils.js')
  , Endpoint = require('../..').Endpoint

// refs for our timeouts
var timeouts = []

// tests --------------------------------------------------------

function EndpointSpecs () {

  test('Endpoint should be created with proper defaults', (t) => {
    var e = new Endpoint()
    t.equal(e._handles, null, 'inputs is null')
    t.equal(typeof(e.propogate), 'function', 'has a method propogate')
    e = utils.makeSpyEndpoint()
    t.equal(typeof(e._handles[0]), 'function', '_handles is a list of functions')
    t.deepEqual(e._handles, e._fn() 'handles are properly applied from input fn') 
    t.end()
  })

  test.skip('_takeFromUpstream swaps handler input streams, with no interruption to their activity')

  test.skip('shouldn\'t be able to attach anything to an endpoint')

  test.skip('should trigger taredown() methods in functions passed in, if they exist')

  // tests for validation ----------------------------------------

  test.skip('validates user input fn')

  test.skip('won\'t attach downstream')

  // cleanup tests -----------------------------------------------

  test('cleanup', function (t) {
    t.plan(1)
    timeouts.forEach((t) => clearTimeout(t))
    t.ok(true, 'cleaned up')
  })


}

module.exports = EndpointSpecs