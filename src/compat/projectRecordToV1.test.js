import { projectRecordToV1 } from './projectRecordToV1'

describe('projectRecordToV1', () => {
  test('derives websites from uris and strips uris + schema', () => {
    const v2 = {
      id: 'rec1',
      schema: 2,
      version: 1,
      type: 'login',
      data: {
        title: 'Example',
        uris: [
          { uri: 'https://example.com', match: 'host' },
          { uri: 'https://other.com', match: 'baseDomain' }
        ],
        websites: ['stale']
      }
    }

    expect(projectRecordToV1(v2)).toEqual({
      id: 'rec1',
      version: 1,
      type: 'login',
      data: {
        title: 'Example',
        websites: ['https://example.com', 'https://other.com']
      }
    })
  })

  test('falls back to websites when uris absent', () => {
    const record = {
      id: 'rec1',
      type: 'login',
      data: { title: 'X', websites: ['https://a.com'] }
    }
    expect(projectRecordToV1(record).data.websites).toEqual(['https://a.com'])
  })

  test('throws when record missing', () => {
    expect(() => projectRecordToV1(null)).toThrow('record required')
  })
})
