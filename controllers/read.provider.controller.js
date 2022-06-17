const express = require('express')
const router = express.Router()
const { logger } = require('../helpers/logger.helpers')
const k8s = require('@kubernetes/client-node')
const request = require('request')
const yaml = require('js-yaml')
const stringHelpers = require('../helpers/string.helpers')
const fs = require('fs')
const { packageConstants } = require('../constants')
const axios = require('axios')

router.get('/', async (req, res, next) => {
  try {
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()

    const opts = {}
    kc.applyToRequest(opts)

    // PROVIDERS        /apis/pkg.crossplane.io/v1/providers
    // CONFIGURATIONS   /apis/pkg.crossplane.io/v1/configurations

    const response = {
      items: []
    }

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

    let items = []
    yamlItems.forEach((x) => {
      try {
        const payload = yaml.load(x)
        if (payload.items && payload.items.length > 0) {
          items = items.concat(payload.items)
        }
      } catch (e) {
        logger.error(e)
      }
    })

    response.items = await Promise.all(
      items.map(async (x) => {
        logger.debug(JSON.stringify(x))
        const info = {
          kind: x.kind,
          icon: packageConstants.icon,
          name: x.metadata.name,
          version: x.spec.package.split(':')[1],
          healthy: 'Unknown'
        }
        try {
          if (x.status.conditions) {
            const healthy = x.status.conditions.find(
              (x) => x.type === 'Healthy'
            )
            if (healthy) {
              info.healthy = healthy.status
            }
          }
        } catch {}

        if (x.metadata.annotations && x.metadata.annotations['metaUrl']) {
          const url = x.metadata.annotations['metaUrl']
          if (url) {
            const resp = await axios.get(url)
            const content = yaml.load(resp.data)
            info.description =
              content.metadata.annotations['meta.crossplane.io/description']
            if (content.metadata.annotations['meta.crossplane.io/iconURI']) {
              info.icon =
                content.metadata.annotations['meta.crossplane.io/iconURI']
            }

            const annotations = [
              'meta.crossplane.io/maintainer',
              'meta.crossplane.io/license',
              'meta.crossplane.io/source'
            ]

            annotations.forEach((key) => {
              if (content.metadata.annotations[key]) {
                info[key.replace('meta.crossplane.io/', '')] =
                  content.metadata.annotations[key]
              }
            })
          }
        }
        return info
      })
    )

    logger.debug(JSON.stringify(response))
    logger.info(`Found ${response.items.length} items`)

    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
})

module.exports = router
