'use strict'
var EventEmitter = require('events').EventEmitter
// criteria is a list like
//
//    [
//      [ proposition, 'err if proposition is false']
//      [ rv[0].length === true, 'items in fn's return value should be lists' ]
//      ...
//    ]
//
// validate returns an object
//
//    {
//      error: err,
//      returnVal: rv,
//    }
//
// where `returnVal` is fn()
//
function validate (errorMsg, fn, criteria, args) {
  var err;
  // check that fn is a function
  try {
    if (args)
      var rv = fn.apply(null, args)
    else
      var rv = fn()
  } catch (e) {
    if (typeof(fn) !== 'function')
      err = 'Error: abitof.Component.update() takes a function. You passed ' + typeof(fn)
    else
      err = e
    return {
      error: err,
      returnVal: null,
    }
  }
  // reduce over criteria
  var ok = criteria(rv).reduce((acc, cur, i) => {
    if (acc) {
      if (cur[0])
        return true
      else {
        if (!err) {
          err = errorMsg
        }
        return false
      }
    }
    return false
  }, true)
  return {
    error: err,
    returnVal: rv,
  }
}

function originFn  (fn) {
  var errorMsg = 'Origin\'s function should return a list of \n [ [ EventEmitter, \'event\'] ... ]. Note how that\'s a list of lists.' 
  var originCriteria = function (rv) {
    // origin fn return value
    return [
      // exists
      [ rv ],
      // is a list
      [ rv.length ],
      [ rv.length > 0 ],
      // is a list of lists
      [ rv[0].length ],
      // inner list first value is event emitter
      [ EventEmitter.prototype.isPrototypeOf(rv[0][0]) ],
      // inner list second value is string
      [ typeof(rv[0][1]) === 'string' ],
    ]
  }
  return validate(errorMsg, fn, originCriteria)
}

function transformFn (fn, args) {
  var errorMsg  = 'Transform\'s function should return a list of \n [ stream1, stream2, ... ].'
  var trasnformCriteria = function (rv) {
    return [
      [ rv ],
      // rv should be a list
      [ rv.length ],
      [ rv.length > 0 ],
      // elements of rv should be a stream
      [ rv[0]._dispatcher  ],
    ]
  }
  return validate(errorMsg, fn, trasnformCriteria, args)
}

function endpointFn (fn) {
  var errorMsg  = 'Endpoint\'s function should return a list of functions.'
  var trasnformCriteria = function (rv) {
    // if we're using the taredown api,
    if (rv.taredown || rv.handlers) {
      return [
        [ rv ], 
        // handlers should be a list
        [ rv.handlers ],
        [ rv.handlers.length ],
        [ rv.handlers.length > 0],
        // taredown is optional, but it should be a function, if it exists
        [ typeof(rv.taredown) === 'function' || !rv.taredown, ],
        // items in handlers should be functions
        [ typeof(rv.handlers[0]) === 'function' ],
      ]
    }
    // otherwise, we're using the handlers-only api
    return [
      [ rv ],
      // rv should be a list 
      [ rv.length ],
      [ rv.length > 0 ],
      // items in that list should be functions
      [ typeof(rv[0]) === 'function' ],
    ]
  }
  return validate(errorMsg, fn, trasnformCriteria)
}

module.exports = {
  originFn: originFn,
  transformFn: transformFn,
  endpointFn: endpointFn,
}