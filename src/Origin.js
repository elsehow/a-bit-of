// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

// TODOS
// multiple downstreams?
// rethink the way error handling works
// `detach` function?

var Component   = require('./Component')
  , Kefir       = require('kefir')
  , validate    = require('./validators.js').originFn

// this returns a function that clears all event listeners
// emittersList: [  [ emitter, 'event']  ...  ]
function makeRemoveListenersFn (emittersList) {
  return function () {
    emittersList.forEach((v) => 
      v[0].removeAllListeners(v[1]))
  }
}

function streamsFrom (emittersList) {
  return emittersList.map((v) => 
    Kefir.fromEvents(v[0], v[1]))
}

class Origin extends Component {

  constructor (errorCb) {
    super(errorCb)
    this._removeListeners = function () { } 
    // origins have no _takeFromUpstream() method
    // nothing can be upstream of an origin.
    this._takeFromUpstream = null
  }

  // takes in a new function
  // makes fresh kefir streams from that function's event emitters
  // it re-executes the WHOLE origin setup function - including any state it holds.
  // returns a list of kefir streams
  // (see Origin API)
  update (fn) {
    // execute the new function
    // remember this fn may contain state -
    // serial, websocket connections, etc
    // so we're very careful about when we run it
    var val = validate(fn)
    if (val.error) {
      this._errorCb(val.error)
      return
    } 
    this._fn = fn
     // remove all old event listeners
    this._removeListeners()
    // origin return values are a list of:
    //    [  [ emitter, 'event']  ...  ]
    this._emittersList = val.returnVal
    // make a new `removeListeners` fn for the new emitters
    this._removeListeners = makeRemoveListenersFn(this._emittersList)
    // make new output streams from the new emitters
    this._outputs = streamsFrom(this._emittersList)
    // propogate changes to the downstream layer
    super._sendChangesDownstream(this._outputs)
    return this
  }
}

module.exports = Origin