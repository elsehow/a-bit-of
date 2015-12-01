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

class Endpoint extends Component {

  constructor (fn) {
    super(fn)
    this.update(fn)
  }

  update (newFn) {
    // if no error, take the fn
    this.fn = newFn
    // if we have any inputs
    if (this.inputs) {
      // re run fn on our inputs, set our outputs
      this.outputs = this.fn.apply(null, this.inputs)
      // validate the transform fn by looking at these outputs
      // var r = validators.transformFn(this.outputs)
      // // set this.error if need be
      // if (r.err) {
      //   this.error = r.err
      //   return
      // }
    }
    super.update()
  }

  // methods inherited from Component:

  // attach()

  // propogate()
 
}

module.exports = Endpoint 