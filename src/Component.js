'use strict'

var validators = require('./validators')

class Component {

  // child class constructors should call update() after calling super()
  constructor () {
    this._fn = () => null
    this._inputs = null
    this._outputs = null
    this._downstream = null
  }

  _sendChangesDownstream () {
    // propogate changes to the downstream layer
    if (this._downstream) {
      // we assume each downstream has an `propogate` method
      // we call that method on `this`.
      // our changes flow downstream.
      this._downstream._takeFromUpstream(this._outputs)
    }
  }

  // propogate changes from an upstream node
  _takeFromUpstream (upstreamOutputs) {
    this._inputs = upstreamOutputs
    this.update(this.fn)
  }

  // components will overwrite this function
  // it takes an input function.
  // usually, at the end of it, you'd want to call _sendChangesDownstream()
  update (fn) {
    // do stuff
  }

  // attach a downstream node
  attach (downstream) {
    this._downstream = downstream
    this._sendChangesDownstream()
    // we return downstream so we can chain attach() statements
    return this._downstream
  }

}

module.exports = Component