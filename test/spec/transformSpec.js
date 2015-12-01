'use strict'

var test = require('tape')
  , abitof = require('../..')
  , EventEmitter = require('events').EventEmitter
  , errorMessages = require('../../src/validators').errorMessages
  , Origin = require('../..').Origin
  , Transform = require('../..').Transform

// our consumer function emits 'value' events through this emitter
var outputEmitter = new EventEmitter()

// refs for our timeouts
var timeouts = []

// TODO
// ALL components should get some prototypical methods..
// - attach to a downstream
// - attach to an upstream
// - validate downstream
// - validate upstream

//  testing equipment --------------------------------------------------

// a simple origin  - a stream of 1s
function makeOneOrigin () {
  return new Origin(function originFn () {
    // make an event emitter
    var oneEmitter = new EventEmitter()
    var t = setInterval(() => oneEmitter.emit('number', 1), 300)
    timeouts.push(t)
    // return value conforms to the producer API
    return [
      [ oneEmitter, 'number' ]
    ]
  })
}

// another simple origin  - a stream of 2s
var twoOrigin = new Origin(function originFn () {
  // make an event emitter
  var twoEmitter = new EventEmitter()
  var t = setTimeout(() => twoEmitter.emit('number', 2), 300)
  timeouts.push(t)
  // return value conforms to the producer API
  return [
    [ twoEmitter, 'number' ]
  ]
})

// 1 simple transform fn
function timesTwoTransform (stream) {
  return [
    stream.map((x) => x*2)
  ]
}

// another simple transform fn
function timesThreeTransform (stream) {
  return [
    stream.map((x) => x*3)
  ]
}


// tests --------------------------------------------------------

function TransformSpecs () {

  test('Transform should have an update function', function (t) {
    t.plan(2)
    var o = new abitof.Transform(timesTwoTransform)
    t.ok(o.update, 'update fn exists')
    t.equal(typeof(o.update), 'function', 'update is a fn')
  })


  test('downstream should be null', function (t) {
    t.plan(1)
    var o = new abitof.Transform(timesTwoTransform)
    t.equal(o.downstream, null, 'downstream == null')
  })


  test('upstream should be null', function (t) {
    t.plan(1)
    var o = new abitof.Transform(timesTwoTransform)
    t.equal(o.upstream, null, 'upstream == null')
  })


  test('should be able to attach a downstream and an upstream', function (t) {
    // we'll use this event emitter to spy on output from Origin
    var spy = new EventEmitter()
    // now we should see a 2 come out of our spy in the downstream
    spy.on('value', (v) => {
      t.equal(v, 2, 'we get values from attaching a downstream to an origin.')
      spy.removeAllListeners('value')
      t.end()
    })
    // make a downstream with our spy in it
    class Downstream {
      constructor () {
        this.inputs = null
        this.handle = (x) => {
          spy.emit('value', x)
        }
      }
      propogate (upstream) {
        this.inputs = upstream.outputs
        this.inputs.forEach((i) =>  {
          i.onValue(this.handle) 
        })
      }
    }
    // attach the 1-emitting origin to our transform
    var oneOrigin = makeOneOrigin()
    // make a new transform
    var o = new Transform(timesTwoTransform)
    // make a downstream with our spy in it
    var myDownstream = new Downstream()
    // attach origin to transform, transform to downstream
    oneOrigin.attach(o).attach(myDownstream)
    t.notOk(o.error, 'should be no error after attaching to downstream')
    t.equal(o.downstream, myDownstream, 'downstream should have attached.')
  })


  // tests for validation ----------------------------------------

  // cleanup tests -----------------------------------------------
  test('cleanup', function (t) {
    t.plan(1)
    timeouts.forEach((t) => clearTimeout(t))
    t.ok(true, 'cleaned up')
  })

}

module.exports = TransformSpecs



