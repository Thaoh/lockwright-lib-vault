import { deriveWebsitesFromUris } from './recordSchema'

/**
 * Project a v2 (or app) record to v1 wire shape.
 * websites = uris.map(u => u.uri) or existing string websites; strip uris + schema.
 * @param {object} record
 * @returns {object}
 */
export const projectRecordToV1 = (record) => {
  if (!record || typeof record !== 'object') {
    throw new Error('projectRecordToV1: record required')
  }

  const rest = { ...record }
  delete rest.schema
  delete rest.previousData
  delete rest.skipV1Projection

  const dataIn = rest.data && typeof rest.data === 'object' ? rest.data : {}
  const { uris, ...dataRest } = dataIn

  const websites = deriveWebsitesFromUris(
    uris,
    Array.isArray(dataRest.websites) ? dataRest.websites : undefined
  )

  return {
    ...rest,
    data: {
      ...dataRest,
      websites
    }
  }
}
