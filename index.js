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

  // function to give us fresh args for process()
  function newProcessArgs() {
    return proccessArgs = rv.args.map(function (emev) {
      return rv.fn(emev[0], emev[1])
    })
  }

  // function to remove all old listeners
  // we'll need this when we hot-swap,
  // to remove the old listeners process() applied
  function removeOldListeners () {
    rv.args.forEach(function (emev) {
      emev[0].removeAllListeners(emev[1])
    })
  }

  // whenever there's any error in the app
  function handleError (err) {
    // emit an error
    emitter.emit('error', err)
    // tares down the app to prevent further error-ing
    removeOldListeners()
    return
  }

  // we run this to start the app
  // it returns a function that re-loads the app
  // (changes to process() are hot-reloaded - changes to setup() are not)
  function bootstrap (s) {

    // returns fn to run script 
    return function () {
      console.log("doin stuff")
      // remove old listeners
      removeOldListeners()
      // execute process() on setup()'s arguments
      // NOTE! we're running `s`, from out of scope
      // we're referring to the `s` that's been `require`d 
      // into the module-level scope, below
      var r = s.process.apply(null, newProcessArgs())
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
