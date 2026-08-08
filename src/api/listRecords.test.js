import { listRecords } from './listRecords'
import { pearpassVaultClient } from '../instances'

describe('listRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lists record-v2/ and normalizes to app records', async () => {
    const mockRecords = [
      {
        id: '1',
        type: 'login',
        data: { title: 'A', websites: ['https://a.com'] }
      }
    ]
    pearpassVaultClient.activeVaultList.mockResolvedValueOnce(mockRecords)

    const result = await listRecords()

    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledWith(
      'record-v2/'
    )
    expect(result[0].schema).toBe(2)
    expect(result[0].data.uris).toEqual([
      { uri: 'https://a.com', match: 'baseDomain' }
    ])
  })

  it('should propagate errors', async () => {
    const mockError = new Error('API error')
    pearpassVaultClient.activeVaultList.mockRejectedValueOnce(mockError)

    await expect(listRecords()).rejects.toThrow(mockError)
    expect(pearpassVaultClient.activeVaultList).toHaveBeenCalledWith(
      'record-v2/'
    )
  })
})
