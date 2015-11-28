var abitof = require('..')
 , test = require('tape')
 , fs = require('fs')
 , path = require('path')

function readSync (p) {
  return fs.readFileSync(p)
}

function writeSync (f, d) {
  fs.writeFileSync(f, d, { flags: 'w' })
  return
}

function copySync (p1, p2) {
  writeSync(p2, readSync(p1))
  return
}

function pathTo (f) {
  return __dirname + '/' + f
}

function writeScript (sourceScript, targetScript) {
  copySync(pathTo(sourceScript), pathTo(targetScript))
  return
}

// write in our initial scripts
writeScript('src/setup-1.js', 'scratch/setup.js')
writeScript('src/process-1.js', 'scratch/process.js')
writeScript('src/output-1.js', 'scratch/output.js')
    
// test-wide reference to our abitof emitter
// setup abitof
var emitter = abitof( 
    pathTo('scratch/setup.js'),
    pathTo('scratch/process.js'),
    pathTo('scratch/output.js'))

// emitter.on('process-update', function (rv) {
//   console.log(rv)
// }

// test('should emit 1 \'process-update\' when we change process script', function (t) {
//   emitter.on('process-update', (r) =>  {
//     t.ok(r)
//     t.end()
//   })
// })

// test('\'process-update\' should contain a list of streams', function (t) {
//   emitter.on('process-update', (r) =>  {
//     r.forEach((i) =>
//       t.ok(i._dispatcher))
//     t.end()
//   })
//   writeScript('src/process-1.js', 'scratch/process.js')
// })

