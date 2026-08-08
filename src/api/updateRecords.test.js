import { updateRecords } from './updateRecords'
import { pearpassVaultClient } from '../instances'

describe('updateRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('dual-writes v2 and v1 by default', async () => {
    const records = [
      {
        id: '123',
        vaultId: '456',
        type: 'login',
        data: {
          title: 'T',
          websites: ['https://a.com'],
          uris: [{ uri: 'https://a.com', match: 'baseDomain' }]
        }
      }
    ]
    pearpassVaultClient.activeVaultAdd.mockResolvedValue()

    await updateRecords(records)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(2)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenNthCalledWith(
      1,
      'record-v2/123',
      expect.objectContaining({ id: '123', schema: 2 })
    )
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenNthCalledWith(
      2,
      'record/123',
      expect.objectContaining({ id: '123' })
    )
  })

  it('skips v1 when previousData is match-only change', async () => {
    const previousData = {
      id: '123',
      vaultId: '456',
      type: 'login',
      updatedAt: 1,
      data: {
        title: 'T',
        username: 'u',
        password: 'p',
        uris: [{ uri: 'https://a.com', match: 'baseDomain' }],
        websites: ['https://a.com']
      }
    }
    const records = [
      {
        id: '123',
        vaultId: '456',
        type: 'login',
        updatedAt: 2,
        previousData,
        data: {
          title: 'T',
          username: 'u',
          password: 'p',
          uris: [{ uri: 'https://a.com', match: 'host' }],
          websites: ['https://a.com']
        }
      }
    ]
    pearpassVaultClient.activeVaultAdd.mockResolvedValue()

    await updateRecords(records)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'record-v2/123',
      expect.objectContaining({ id: '123' })
    )
    expect(
      pearpassVaultClient.activeVaultAdd.mock.calls[0][1].previousData
    ).toBeUndefined()
  })

  it('skips v1 when skipV1Projection is true', async () => {
    const records = [
      {
        id: '123',
        vaultId: '456',
        type: 'note',
        data: { title: 'n' },
        skipV1Projection: true
      }
    ]
    pearpassVaultClient.activeVaultAdd.mockResolvedValue()

    await updateRecords(records)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'record-v2/123',
      expect.not.objectContaining({ skipV1Projection: true })
    )
  })

  it('should throw an error when activeVaultAdd fails', async () => {
    const records = [{ id: '123', vaultId: '456', type: 'note', data: {} }]
    const error = new Error('Failed to update record')
    pearpassVaultClient.activeVaultAdd.mockRejectedValueOnce(error)

    await expect(updateRecords(records)).rejects.toThrow(error)
  })

  it('should throw when records empty', async () => {
    await expect(updateRecords([])).rejects.toThrow('Record is required')
  })
})
