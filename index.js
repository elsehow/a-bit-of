/* A BIT OF
 * elsehow
 * github.com/elsehow/a-bit-of
 * BSD license
 */

var path = require('path')
  , EventEmitter = require('events').EventEmitter

// api:
//
//    abitof('/home/elsehow/my-script.js')
//
// takes: absolute path to a script file.
//        see readme for the structure of that file.
//

module.exports = function (scriptPath) {

  // we create + return an event emitter
  // where each value in the stream is 
  // the return value of `app`at the time it was saved
  var emitter = new EventEmitter()

  // hotswap overrides `require`
  // but this will only matter for for `scriptPath`.
  // it will cause scriptPath's require() statement to hot reload!
  //
  // `hotswap` here is an event emitter
  // it will emit:
  //
  //   - 'error' (err) -- an error
  //   - 'swap'  ()    -- notification that scriptPath was swapped.
  //
  var hotswap = require('hotmop')(scriptPath) 

  var script = require(scriptPath)

  // let's run the script's setup()
  var rv = script.setup()

  // the return value of `script` is a list
  //
  //    [ {em, ev, fn} ... ]
  //
  // our job is to 
  //
  // (1) make a fn to remove all event handlers
  //     we use this when process refreshes, so we can add new event handlers
  //
  // (2) make a fn that generates the args from process
  //     again, when procss refreshes, we re-generate the 
  //     arguments and run it again creating new event handlers.)

  function removeAllEventHandlers () {
    return rv.forEach(function (o) {
      o.em.removeAllListeners(o.ev)
    })
  }

  function generateArgsForProcess () {
    return rv.map(function (o) {
      return o.fn(o.em, o.ev)
    })
  }

  // whenever there's any error in the app
  function handleError (err) {
    // emit an error
    emitter.emit('error', err)
    // tares down the app to prevent further error-ing
    removeAllEventHandlers()
    return
  }

  // we run this to start the app
  // it returns a function that re-loads the app
  // (changes to process() are hot-reloaded - changes to setup() are not)
  function bootstrap (s) {

    // returns fn to run script 
    return function () {
      // remove old listeners
      removeAllEventHandlers()
      // execute process() on setup()'s arguments
      // NOTE! we're running `s`, from out of scope
      // we're referring to the `s` that's been `require`d 
      // into the module-level scope, below
      var pargs = generateArgsForProcess()
      var r = s.process.apply(null, generateArgsForProcess())
      // emit process()'s return values
      emitter.emit('return-val', r)
      return
    }

  }

 
  // we set up the hot-reload functionality here
  var runFn = bootstrap(script)
  // run once
  runFn()
  // re-run on reload
  hotswap.on('swap', runFn)
  // setup error listeners
  hotswap.on('error', handleError) 

  // return an emitter that emits 'return-val' events on file swap
  return emitter

}
