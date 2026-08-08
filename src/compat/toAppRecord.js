import {
  DEFAULT_URI_MATCH,
  SCHEMA_V2,
  deriveUrisFromWebsites,
  deriveWebsitesFromUris
} from './recordSchema'

/**
 * Normalize a v1 or v2 storage record into the app-facing v2 shape.
 * String websites → uris with default match when uris missing.
 * @param {object} record
 * @returns {object}
 */
export const toAppRecord = (record) => {
  if (!record || typeof record !== 'object') {
    throw new Error('toAppRecord: record required')
  }

  const dataIn =
    record.data && typeof record.data === 'object' ? record.data : {}
  const data = { ...dataIn }

  const hasUriShape =
    record.type === 'login' ||
    Array.isArray(data.websites) ||
    Array.isArray(data.uris)

  if (hasUriShape) {
    if (!Array.isArray(data.uris) || data.uris.length === 0) {
      data.uris = deriveUrisFromWebsites(data.websites, data.uris)
    } else {
      data.uris = data.uris.map((entry) => {
        if (
          !entry ||
          typeof entry !== 'object' ||
          typeof entry.uri !== 'string'
        ) {
          return entry
        }
        return {
          uri: entry.uri,
          match:
            typeof entry.match === 'string' && entry.match.length > 0
              ? entry.match
              : DEFAULT_URI_MATCH
        }
      })
    }
    data.websites = deriveWebsitesFromUris(data.uris, data.websites)
  }

  return {
    ...record,
    schema: SCHEMA_V2,
    data
  }
}
