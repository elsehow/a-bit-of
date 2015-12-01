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


// tests --------------------------------------------------------

function EndpointSpecs () {

  test.skip('Endpoint should be created with proper defaults')

  test.skip('should be able to attach an origin')

  test.skip('should be able to swap origin\'s function')

  test.skip('should be able to output\'s function')

  test.skip('shouldn\'t be able to attach anything to an endpoint')

}

module.exports = EndpointSpecs