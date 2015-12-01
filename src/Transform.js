// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

// TODO
// validate: takes a stream, returns an array of streams
// attach () method is IDENTICAL
// propogate () method is also probably IDENTICAL

class Transform () {

  constructor (this.fn) {
    this.inputs = null
    this.outputs = null
    this.downstream = null
    this.update(fn)
  }

  update (newFn) {
    // validate the transform fn
    var r = validators.transformFn(newFn)
    // set this.error if need be
    if (r.err) {
      this.error = r.err
      return
    }
    // if no error, take the fn
    this.fn = newFn
    // if we have any inputs
    if (this.inputs)
      // re run fn on our inputs, set our outputs
      this.outputs = this.fn.apply(null, this.inputs)
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
    downstream.propogate(this)
  }

  propogate (upstream) {
    this.inputs = upstream.outputs
  }

}