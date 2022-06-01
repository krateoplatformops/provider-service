const { envConstants } = require('./constants')

const app = require('./app')

app.listen(envConstants.PORT)
