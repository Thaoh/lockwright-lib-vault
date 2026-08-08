export const RECORD_V1_PREFIX = 'record/'
export const RECORD_V2_PREFIX = 'record-v2/'
export const VAULT_EXT_KEY = 'vault-ext'
export const SCHEMA_V2 = 2
export const DEFAULT_URI_MATCH = 'baseDomain'

const V1_RECORD_RE = /^record\/([^/]+)$/
const V2_RECORD_RE = /^record-v2\/([^/]+)$/
const V1_FILE_RE = /^record\/([^/]+)\/file\/([^/]+)$/
const V2_FILE_RE = /^record-v2\/([^/]+)\/file\/([^/]+)$/

/**
 * @param {string} id
 * @returns {string}
 */
export const recordKeyV1 = (id) => `${RECORD_V1_PREFIX}${id}`

/**
 * @param {string} id
 * @returns {string}
 */
export const recordKeyV2 = (id) => `${RECORD_V2_PREFIX}${id}`

/**
 * @param {string} recordId
 * @param {string} fileId
 * @returns {string}
 */
export const fileKeyV1 = (recordId, fileId) =>
  `${RECORD_V1_PREFIX}${recordId}/file/${fileId}`

/**
 * @param {string} recordId
 * @param {string} fileId
 * @returns {string}
 */
export const fileKeyV2 = (recordId, fileId) =>
  `${RECORD_V2_PREFIX}${recordId}/file/${fileId}`

/**
 * @param {string} key
 * @returns {boolean}
 */
export const isV1RecordKey = (key) =>
  typeof key === 'string' && V1_RECORD_RE.test(key)

/**
 * @param {string} key
 * @returns {boolean}
 */
export const isV2RecordKey = (key) =>
  typeof key === 'string' && V2_RECORD_RE.test(key)

/**
 * @param {string} key
 * @returns {boolean}
 */
export const isV1FileKey = (key) =>
  typeof key === 'string' && V1_FILE_RE.test(key)

/**
 * @param {string} key
 * @returns {boolean}
 */
export const isV2FileKey = (key) =>
  typeof key === 'string' && V2_FILE_RE.test(key)

/**
 * @param {string} key
 * @returns {string|null}
 */
export const parseRecordIdFromKey = (key) => {
  const v1 = typeof key === 'string' ? key.match(V1_RECORD_RE) : null
  if (v1) return v1[1]
  const v2 = typeof key === 'string' ? key.match(V2_RECORD_RE) : null
  if (v2) return v2[1]
  return null
}

/**
 * @param {string} key
 * @returns {{ recordId: string, fileId: string, schema: 1|2 }|null}
 */
export const parseFileKey = (key) => {
  if (typeof key !== 'string') return null
  const v1 = key.match(V1_FILE_RE)
  if (v1) return { recordId: v1[1], fileId: v1[2], schema: 1 }
  const v2 = key.match(V2_FILE_RE)
  if (v2) return { recordId: v2[1], fileId: v2[2], schema: 2 }
  return null
}

/**
 * Prefer v2 path for a file key; leave non-record keys unchanged.
 * @param {string} key
 * @returns {{ primary: string, fallback: string|null }}
 */
export const resolveFileKeyPreferV2 = (key) => {
  const parsed = parseFileKey(key)
  if (!parsed) {
    return { primary: key, fallback: null }
  }
  return {
    primary: fileKeyV2(parsed.recordId, parsed.fileId),
    fallback: fileKeyV1(parsed.recordId, parsed.fileId)
  }
}

/**
 * Stable JSON compare for no-op / match-only detection.
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export const deepEqualJson = (a, b) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

/**
 * @param {string[]|undefined} websites
 * @param {Array<{ uri?: string, match?: string }>|undefined} existingUris
 * @returns {Array<{ uri: string, match: string }>}
 */
export const deriveUrisFromWebsites = (websites, existingUris) => {
  const list = Array.isArray(websites) ? websites : []
  const byUri = new Map()
  if (Array.isArray(existingUris)) {
    for (const entry of existingUris) {
      if (entry && typeof entry.uri === 'string') {
        byUri.set(entry.uri, entry)
      }
    }
  }
  return list.map((uri) => {
    const prev = byUri.get(uri)
    if (prev && typeof prev === 'object') {
      return {
        uri,
        match:
          typeof prev.match === 'string' && prev.match.length > 0
            ? prev.match
            : DEFAULT_URI_MATCH
      }
    }
    return { uri, match: DEFAULT_URI_MATCH }
  })
}

/**
 * @param {Array<{ uri?: string }>|undefined} uris
 * @param {string[]|undefined} fallbackWebsites
 * @returns {string[]}
 */
export const deriveWebsitesFromUris = (uris, fallbackWebsites) => {
  if (Array.isArray(uris)) {
    return uris
      .map((entry) =>
        entry && typeof entry.uri === 'string' ? entry.uri : null
      )
      .filter((uri) => typeof uri === 'string')
  }
  return Array.isArray(fallbackWebsites) ? [...fallbackWebsites] : []
}
