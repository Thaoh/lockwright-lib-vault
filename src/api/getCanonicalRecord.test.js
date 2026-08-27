import { getCanonicalRecord } from './getCanonicalRecord'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGet: jest.fn()
  }
}))

describe('getCanonicalRecord', () => {
  const v2Record = {
    id: 'rec-1',
    schema: 2,
    data: {
      websites: ['https://a.com'],
      uris: [{ uri: 'https://a.com', match: 'exact' }]
    }
  }
  const v1Record = {
    id: 'rec-1',
    data: {
      websites: ['https://a.com']
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw when recordId is missing', async () => {
    await expect(getCanonicalRecord()).rejects.toThrow(
      'Record id is required to get a record'
    )
    await expect(getCanonicalRecord('')).rejects.toThrow(
      'Record id is required to get a record'
    )
  })

  it('returns the v2 record when both namespaces have a row', async () => {
    pearpassVaultClient.activeVaultGet.mockImplementation(async (key) => {
      if (key === 'record-v2/rec-1') return v2Record
      if (key === 'record/rec-1') return v1Record
      return null
    })

    const result = await getCanonicalRecord('rec-1')

    expect(result.data.uris).toEqual([{ uri: 'https://a.com', match: 'exact' }])
  })

  it('falls back to v1 when v2 is missing', async () => {
    pearpassVaultClient.activeVaultGet.mockImplementation(async (key) => {
      if (key === 'record-v2/rec-1') return null
      if (key === 'record/rec-1') return v1Record
      return null
    })

    const result = await getCanonicalRecord('rec-1')

    expect(result).toBe(v1Record)
  })

  it('falls back to v1 when v2 is an empty object', async () => {
    pearpassVaultClient.activeVaultGet.mockImplementation(async (key) => {
      if (key === 'record-v2/rec-1') return {}
      if (key === 'record/rec-1') return v1Record
      return null
    })

    const result = await getCanonicalRecord('rec-1')

    expect(result).toBe(v1Record)
  })

  it('returns null when neither namespace has a row', async () => {
    pearpassVaultClient.activeVaultGet.mockResolvedValue(null)

    const result = await getCanonicalRecord('rec-1')

    expect(result).toBeNull()
  })
})
