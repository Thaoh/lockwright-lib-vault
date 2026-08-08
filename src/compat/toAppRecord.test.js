import { DEFAULT_URI_MATCH, SCHEMA_V2 } from './recordSchema'
import { toAppRecord } from './toAppRecord'

describe('toAppRecord', () => {
  test('converts string websites to uris with default match', () => {
    const v1 = {
      id: 'rec1',
      type: 'login',
      version: 1,
      data: {
        title: 'Example',
        websites: ['https://example.com']
      }
    }

    const app = toAppRecord(v1)
    expect(app.schema).toBe(SCHEMA_V2)
    expect(app.data.uris).toEqual([
      { uri: 'https://example.com', match: DEFAULT_URI_MATCH }
    ])
    expect(app.data.websites).toEqual(['https://example.com'])
  })

  test('preserves existing uri match and syncs websites', () => {
    const v2 = {
      id: 'rec1',
      type: 'login',
      data: {
        uris: [{ uri: 'https://a.com', match: 'exact' }],
        websites: []
      }
    }
    const app = toAppRecord(v2)
    expect(app.data.uris[0].match).toBe('exact')
    expect(app.data.websites).toEqual(['https://a.com'])
  })

  test('fills missing match with default', () => {
    const app = toAppRecord({
      id: 'rec1',
      type: 'login',
      data: { uris: [{ uri: 'https://a.com' }] }
    })
    expect(app.data.uris[0].match).toBe(DEFAULT_URI_MATCH)
  })
})
