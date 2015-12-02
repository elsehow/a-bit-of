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
function validate (fn, criteria, args) {
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
          err = cur[1]
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
    return [
      [ rv, errorMsg ],
      [ rv.length, errorMsg ],
      [ rv.length > 0, errorMsg ],
      [ rv[0].length > 1, errorMsg ],
      [ EventEmitter.prototype.isPrototypeOf(rv[0][0]), errorMsg ],
      [ typeof(rv[0][1]) === 'string', errorMsg ],
    ]
  }
  return validate(fn, originCriteria)
}

function transformFn (fn, args) {
  var trasnformCriteria = function (rv) {
    var errorMsg = 'Transform\'s function should return a list of \n [ stream1, stream2, ... ].'
    return [
      [ rv, errorMsg ],
      // rv should be a list
      [ rv.length, errorMsg ],
      [ rv.length > 0, errorMsg ],
      // elements of rv should be a stream
      [ rv[0]._dispatcher , errorMsg ],
    ]
  }
  return validate(fn, trasnformCriteria, args)
}

function endpointFn (fn, errorCb) {
  var trasnformCriteria = function (rv) {
    var errorMsg = 'Endpoint\'s function should return a list of functions.'
    return [
      [ rv, errorMsg ],
      // rv should be a list
      [ rv.length, errorMsg ],
      [ rv.length > 0, errorMsg ],
      // items in that list should be functions
      [ typeof(rv[0]) === 'function' , errorMsg ],
    ]
  }
  return validate(fn, trasnformCriteria)
}

module.exports = {
  originFn: originFn,
  transformFn: transformFn,
  endpointFn: endpointFn,
}