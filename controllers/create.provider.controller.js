const express = require('express')
const router = express.Router()
const { logger } = require('../helpers/logger.helpers')
const k8s = require('@kubernetes/client-node')
const yaml = require('js-yaml')

router.post('/', async (req, res, next) => {
  try {
    const kc = new k8s.KubeConfig()
    kc.loadFromDefault()
    const client = k8s.KubernetesObjectApi.makeApiClient(kc)
    const specs = yaml.loadAll(yaml.dump(req.body))

    const validSpecs = specs.filter((s) => s && s.kind && s.metadata)

    let valid = 0

    for (const spec of validSpecs) {
      spec.metadata = spec.metadata || {}
      spec.metadata.annotations = spec.metadata.annotations || {}
      delete spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ]
      spec.metadata.annotations[
        'kubectl.kubernetes.io/last-applied-configuration'
      ] = JSON.stringify(spec)
      try {
        await client
          .read(spec)
          .then(async () => {
            await client
              .patch(
                spec,
                {},
                {},
                {},
                {},
                {
                  headers: {
                    'content-type': 'application/merge-patch+json'
                  }
                }
              )
              .then(() => {
                valid++
              })
              .catch((e) => {
                logger.error(e.message)
              })
          })
          .catch(async () => {
            await client
              .create(spec)
              .then(() => {
                valid++
              })
              .catch((e) => {
                // console.log(e)
                logger.error(e.message)
              })
          })
      } catch (e) {
        logger.error(e.message)
      }
    }

    res
      .status(200)
      .json({ message: `Created ${valid} resources of ${validSpecs.length}` })
  } catch (error) {
    next(error)
  }
})

module.exports = router
