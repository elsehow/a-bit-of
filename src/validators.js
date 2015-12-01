var EventEmitter = require('events').EventEmitter

var errorMessages = {
  badOriginFn: 'That origin function :T',
  badDownstream: 'That downstream :T',
}


// validates a downstream that's been passed in
function downstream (ds) {
  var err = {
    err: errorMessages.badDownstream,
    downstream: null
  }
  // downstream should have a propogate function
  if (!ds.propogate)
    return err
  if (!(typeof(ds.propogate) === 'function'))
    return err
  return {
    err: null,
    downstream: ds
  }
}

// validates origin component input functions
function originFn  (fn) {
  var err = {
    err: errorMessages.badOriginFn,
    returnVal: null
  }
  // check that fn is a function
  var t1 = typeof(fn) === 'function'
  if (!t1) 
    return err
  // get return val from fn
  var rv = fn()
  if (!rv) 
    return err
  // check that it retuns a list
  var t2 = rv.length > 0
  if (!t2)
    return err
  // check that each item in the rv
  // looks like
  //
  //   [emitter, 'event']
  //
  var t3 = rv.reduce((acc, r) => {
    if (acc && 
      r.length && 
      EventEmitter.prototype.isPrototypeOf(r[0]) && 
      (typeof(r[1]) === 'string')) {
        return true
    }
    return false
  }, true)

  if (!t3)
    return err

  // passed all the tests
  return {
    err: null,
    returnVal: fn()
  }
  
}

// validates transform component input return values
function transformFn (returnValues) {
  // put a fake Kefir stream through it
  // check that the return value is a list
  // and that the first value is a stream.
  // (there may be other return values - thats fine)
  return {
    err: null
  }

}


module.exports = {

  // validator functions return an object
  //    { err, returnVal }

  originFn: originFn,
  downstream: downstream,
  errorMessages: errorMessages

}