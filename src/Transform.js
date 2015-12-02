// A BIT OF
// github.com/elsehow/a-bit-of
// elsehow
// BSD 

'use strict'

var Component = require('./Component')
var validators = require('./validators')

// TODO
// validate: input fn a stream, returns an array of streams
// inheritence works?

class Transform extends Component {

  constructor (fn) {
    super()
    this.update(fn)
  }

  update (newFn) {
    if (newFn)
      this.fn = newFn
    // if we have any inputs
    if (this.inputs) 
      // re run fn on our inputs, set our outputs
      this.outputs = this.fn.apply(null, this.inputs)
    // propogate these changes downstream
    super._flowDownstream()
  }

  // methods inherited from Component:

  // attach()

  // propogate()
 
}

module.exports = Transform