'use strict'

var validators = require('./validators')

class Component {

  constructor () {
    // if (fn)
    //   this.fn = fn
    // else
    //   this.fn = function () { return null } 
    this.inputs = null
    this.outputs = null
    this.downstream = null
    this.upstream = null
  }

  _flowDownstream () {
    // propogate changes to the downstream layer
    if (this.downstream) {
      // we assume each downstream has an `propogate` method
      // we call that method on `this`.
      // our changes flow downstream.
      this.downstream.propogate(this)
    }
  }

  // attach a downstream node
  attach (downstream) {
    // validate input
    var r = validators.downstream(downstream)
    // throw any errors and exit
    if (r.err) {
      this.error = r.err
      return
    } 
    this.downstream = downstream
    this._flowDownstream()
    // we return downstream so we can chain attach() statements
    return this.downstream
  }

  // propogate changes from an upstream node
  propogate (upstream) {
    this.inputs = upstream.outputs
    this.update(this.fn)
  }

}

module.exports = Component