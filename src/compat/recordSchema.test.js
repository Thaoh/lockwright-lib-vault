import {
  RECORD_V1_PREFIX,
  RECORD_V2_PREFIX,
  SCHEMA_V2,
  DEFAULT_URI_MATCH,
  recordKeyV1,
  recordKeyV2,
  fileKeyV1,
  fileKeyV2,
  isV1RecordKey,
  isV2RecordKey,
  parseFileKey,
  resolveFileKeyPreferV2,
  deriveUrisFromWebsites,
  deriveWebsitesFromUris,
  deepEqualJson
} from './recordSchema'

describe('recordSchema', () => {
  test('prefixes and key builders', () => {
    expect(RECORD_V1_PREFIX).toBe('record/')
    expect(RECORD_V2_PREFIX).toBe('record-v2/')
    expect(SCHEMA_V2).toBe(2)
    expect(DEFAULT_URI_MATCH).toBe('baseDomain')
    expect(recordKeyV1('a')).toBe('record/a')
    expect(recordKeyV2('a')).toBe('record-v2/a')
    expect(fileKeyV1('a', 'f')).toBe('record/a/file/f')
    expect(fileKeyV2('a', 'f')).toBe('record-v2/a/file/f')
  })

  test('classifiers do not confuse record/ with record-v2/', () => {
    expect(isV1RecordKey('record/abc')).toBe(true)
    expect(isV1RecordKey('record-v2/abc')).toBe(false)
    expect(isV2RecordKey('record-v2/abc')).toBe(true)
  })

  test('resolveFileKeyPreferV2', () => {
    expect(resolveFileKeyPreferV2('record/a/file/f')).toEqual({
      primary: 'record-v2/a/file/f',
      fallback: 'record/a/file/f'
    })
    expect(resolveFileKeyPreferV2('record-v2/a/file/f')).toEqual({
      primary: 'record-v2/a/file/f',
      fallback: 'record/a/file/f'
    })
    expect(resolveFileKeyPreferV2('other')).toEqual({
      primary: 'other',
      fallback: null
    })
    expect(parseFileKey('record/a/file/f')).toEqual({
      recordId: 'a',
      fileId: 'f',
      schema: 1
    })
  })

  test('deriveUrisFromWebsites preserves match for known uris', () => {
    expect(
      deriveUrisFromWebsites(
        ['https://a.com', 'https://b.com'],
        [{ uri: 'https://a.com', match: 'host' }]
      )
    ).toEqual([
      { uri: 'https://a.com', match: 'host' },
      { uri: 'https://b.com', match: DEFAULT_URI_MATCH }
    ])
  })

  test('deriveWebsitesFromUris', () => {
    expect(
      deriveWebsitesFromUris([
        { uri: 'https://a.com' },
        { uri: 'https://b.com' }
      ])
    ).toEqual(['https://a.com', 'https://b.com'])
    expect(deriveWebsitesFromUris(undefined, ['https://x.com'])).toEqual([
      'https://x.com'
    ])
  })

  test('deepEqualJson', () => {
    expect(deepEqualJson({ a: 1 }, { a: 1 })).toBe(true)
    expect(deepEqualJson({ a: 1 }, { a: 2 })).toBe(false)
  })
})
