const express = require('express')
const router = express.Router()
const logger = require('../service-library/helpers/logger.helpers')
const k8s = require('@kubernetes/client-node')
const request = require('request')
const yaml = require('js-yaml')
const { packageConstants } = require('../constants')

router.delete('/', async (req, res, next) => {
  try {
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()

    const client = k8s.KubernetesObjectApi.makeApiClient(kc)

    const opts = {}
    kc.applyToRequest(opts)

    let yamlItems = []
    yamlItems = await Promise.all(
      packageConstants.list.map(async (r) => {
        logger.debug(encodeURI(`${kc.getCurrentCluster().server}/${r.api}`))
        return await new Promise((resolve, reject) => {
          request(
            encodeURI(`${kc.getCurrentCluster().server}/${r.api}`),
            opts,
            (error, response, data) => {
              logger.debug(JSON.stringify(response))
              if (error) {
                logger.error(error)
                reject(error)
              } else resolve(data)
            }
          )
        })
      })
    )

    const items = yamlItems
      .map((x) => {
        const y = yaml.load(x)
        return [...y.items]
      })
      .flat()

    const pkg = items.find(
      (i) => i.metadata.name === req.body.name && i.kind === req.body.kind
    )

    if (pkg) {
      await client
        .delete(pkg)
        .then(() => {
          res.status(200).send()
        })
        .catch((e) => {
          logger.error(e.message)
          res.status(500).json({ message: e.message })
        })
    } else {
      res.status(409).json()
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
