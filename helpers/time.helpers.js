const moment = require('moment')

const currentTime = () => {
  return moment.utc().unix()
}

const daysAgo = (days) => {
  return moment()
    .utc()
    .add(days * -1, 'days')
    .startOf('day')
    .unix()
}

const fromDateToEpoch = (date) => {
  return moment(date).unix()
}

module.exports = {
  currentTime,
  daysAgo,
  fromDateToEpoch
}
