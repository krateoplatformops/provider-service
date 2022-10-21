const { envConstants } = require('./service-library/constants')

const app = require('./app')

app.listen(envConstants.PORT)
