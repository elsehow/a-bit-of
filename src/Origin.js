// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

// TODOS
// multiple downstreams?
// rethink the way error handling works
// `detach` function?

var Component = require('./Component')
var kefir = require('kefir')
var validators = require('./validators')

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

function updateOutputs (emittersList) {
  if (emittersList)
    return makeStreams(emittersList)
  return
}

class Origin extends Component {

  constructor (fn) {
    super()
    this.removeListeners = function () { } 
    // note that Origin has no propogate() method.
    this.propogate = null
    this.update(fn)
  }

  // this takes in a new function
  update (newFn) {
    if (newFn)
      this.fn = newFn
    // remove all old event listeners
    this.removeListeners()
    // make a new `removeListeners` fn
    this.removeListeners = makeRemoveListenersFn(this.fn())
    // make new output streams
    this.outputs = updateOutputs(this.fn())
    // propogate changes to the downstream layer
    super._flowDownstream()
  }

  // inherited from Component:
  // attach()
  // note that Origin has no propogate() method.

}

module.exports = Origin