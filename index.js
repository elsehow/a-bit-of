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
  // but this will only matter for for `appPath`.
  // it will cause appPath's require() statement to hot reload!
  //
  // `hotswap` here is an event emitter
  // it will emit:
  //
  //   - 'error' (err) -- an error
  //   - 'swap'  ()    -- notification that appPath was swapped.
  //
  var hotswap = require('hotmop')(scriptPath) 

  function charm (setupFnReturnVal) {

    // state
    var fn = setupFnReturnVal.fn
      , args = setupFnReturnVal.args

    // fn to remove existing listeners from the setup fn's emitters
    function removeAllListeners () {
      function removeListener (emev) {
        emev.emitter.removeAllListeners(emev.ev)
      }
      args.forEach(removeListener)
      return
    }

    // fn to apply the user's transformation to all setup fn's emitters
    function applyFunction (emev) {
      return fn(emev.emitter, emev.ev)
    }

    // on every new require, we parse the app script for errors
    // if we catch one, we emit 'error' instead of crashing!
    // set up new error listeners
    hotswap.on('error', function (err) {
      // effectively tare down the app
      removeAllListeners() 
      // emit the error
      emitter.emit('error', err)
    })

    // charm returns two things:
    // a list of `args` for process()
    // and a function for removing all the current arguments
    // these are the new args for process
    return {
      removeListenersFn: removeAllListeners,
      processArgs: args.map(applyFunction),
    }
  }

  // we run this to start the app
  // it returns a function that can check how to hotswap the app
  // (changes to setup restart the app entirely - changes to process() do not)
  function bootstrap (userScript) {

    // state 
    var oldSetupFn = null
      , oldProcessFn = null
      , args = null
      , removeListenersFn = null

    // fn to rerun script from scratch
    function run (setfn, procfn) {
      var vs = charm(setfn())
      var r = procfn.apply(null, vs.processArgs)
      emitter.emit('return-val', r)
      // update the state
      oldSetupFn = setfn
      oldProcessFn = procfn
      // return a fn to remove the listeners that the process fn sets up
      return vs.removeListenersFn
    }

    // do an initial run
    removeListenersFn = run(userScript.setup, userScript.process)

    // return a function to execute on every hotswap!
    return function (newUserScript) {

      // current function values
      setupFn = newUserScript.setup
      processFn = newUserScript.process

      if (setupFn == oldSetupFn) 
        console.log('no change at all in setup()!')

      if (processFn == oldProcessFn) 
        console.log('no change at all in process()!')


      // remove all the old listeners
      removeListenersFn()

      // run the new script, get the new ones
      // get the new ones
      removeListenersFn = run(setupFn, processFn)
      return
    }
  }

  // here's where we require the user script, `s`
  // that hotswap module overwrites `require`
  // it will change the pointer to the new fn in mid-air
  // and the event emitter `hotswap` will emit 2 kinds of events: 
  //    - 'swap'
  //    - 'error'

  var s = require(scriptPath)

  // we set up the hot-reload functionality here
  
  var changeChecker = bootstrap(s)

  hotswap.on('swap', function () {
    changeChecker(s)
  })

  // return an emitter that emits 'return-val' events on file swap
  return emitter

}
