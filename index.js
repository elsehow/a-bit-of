// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

// TODOS
// validate input fn
// fig out update fn

var kefir = require('kefir')

// origin return values are a list of:
//
//  [
//    [ emitter, 'event']
//    ...
//  ]
//
// this returns a function that clears all event listeners
function makeRemoveListenersFn (emittersList) {
  return function () {
    emittersList.forEach((v) => 
      v[0].removeAllListeners(v[1]))
  }
}

// this function returns a list of kefir streams
function makeStreams (emittersList) {
  return emittersList.map((v) => 
    kefir.fromEvents(v[0], v[1]))
}

function validateOriginFn (f) {
  return {
    err: null,
    returnVal: f()
  }
}

function updateOutputs (emittersList) {
  if (emittersList)
    return makeStreams(emittersList)
  return
}

class Origin {

  constructor (fn) {
    // initiate internal state variables
    // this bit illustrates what state an Origin has
    this.fn = function () { } 
    this.outputs = []
    this.downstream = null
    this.removeListeners = function () { } 
    this.update(fn)
  }

  // this takes in a new function
  update (newFn, cb) {
    // validate input fn
    var r = validateOriginFn(newFn)
    // throw any errors and exit
    if (r.err) {
      throw r.err
      return
    }
    // set the new function
    this.fn = newFn
    // remove all old event listeners
    this.removeListeners()
    // make a new `removeListeners` fn
    this.removeListeners = makeRemoveListenersFn(r.returnVal)
    // make new output streams
    this.outputs = updateOutputs(r.returnVal)
    // propogate changes to the downstream layer
    if (this.downstream.length > 0) {
      // we assume each downstream has an `update` function
      this.downstream.forEach((d) => 
        // we call that update function on ourself
        // so that our changes can flow downstream.
        d.update(this))
    }
  }

}

module.exports = {
  Origin: Origin
}
