const to64 = (input) => {
  return Buffer.from(input).toString('base64')
}

const b64toAscii = (input) => {
  return Buffer.from(input, 'base64').toString('ascii')
}

module.exports = {
  to64,
  b64toAscii
}
