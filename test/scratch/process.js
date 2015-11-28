function process (oneStream) {

  return [
    oneStream.map(x => x*1)
  ]

}

module.exports = process
