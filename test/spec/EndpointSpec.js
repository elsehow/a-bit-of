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

  test.skip('')

}

module.exports = EndpointSpecs