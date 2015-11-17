module.exports = function (stream) {

  stream
    .map(Number)
    .map(function (x) {
      return x*3
    })
    .log()
}

