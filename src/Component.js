'use strict'

class Component {

  // child class constructors should call update() after calling super()
  constructor (errorCb) {
    this._fn = () => null
    this._inputs = null
    this._outputs = null
    this._downstream = null
    if (errorCb && typeof(errorCb) === 'function')
      this._errorCb = errorCb
    else {
      this._errorCb = function (err) {
        throw err
      }
    }
  }

  _sendChangesDownstream (myOutputs) {
    // propogate changes to the downstream layer
    if (this._downstream) {
      // we assume each downstream has an `propogate` method
      // we call that method on `this`.
      // our changes flow downstream.
      this._downstream._takeFromUpstream(myOutputs)
    }
  }

  // propogate changes from an upstream node
  _takeFromUpstream (upstreamOutputs) {
    this._inputs = upstreamOutputs
    this.update(this._fn)
  }

  // components will overwrite this function
  // it takes an input function.
  // usually, at the end of it, you'd want to call _sendChangesDownstream()
  update (fn) {
    // do stuff
  }

  // attach a downstream node
  attach (downstream) {
    if (downstream._takeFromUpstream) {
      this._downstream = downstream
      this._sendChangesDownstream()
      this._downstream._inputs = this._outputs
      this._downstream.update()
      // we return downstream so we can chain attach() statements
      return this._downstream
    }
    this._errorCb('Can\'t attach to this downstream. It has no attach() method. ' + downstream) 
    return
  }

}

module.exports = Component