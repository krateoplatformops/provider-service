module.exports = (req, res, next) => {
  let oldSend = res.send
  res.send = (data) => {
    try {
      if (data) {
        data = JSON.parse(data)

        if (data.list && Array.isArray(data.list)) {
          data.count = data.list.length
        }
      }
    } catch {}

    res.send = oldSend
    return res.send(data)
  }
  next()
}
