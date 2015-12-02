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