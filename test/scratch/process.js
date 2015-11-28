function process (oneStream) {

  return [
    oneStream.map(x => x*3)
  ]

}

module.exports = process
