import { createRecord } from './createRecord'
import { pearpassVaultClient } from '../instances'

describe('createRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('dual-writes record-v2 then record projection', async () => {
    const record = {
      id: 'test-id',
      vaultId: 'test-vault-id',
      type: 'login',
      data: {
        title: 'Example',
        websites: ['https://example.com']
      }
    }

    await createRecord(record)

    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(2)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenNthCalledWith(
      1,
      'record-v2/test-id',
      expect.objectContaining({
        id: 'test-id',
        schema: 2,
        data: expect.objectContaining({
          uris: [{ uri: 'https://example.com', match: 'baseDomain' }]
        })
      })
    )
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenNthCalledWith(
      2,
      'record/test-id',
      expect.objectContaining({
        id: 'test-id',
        data: expect.objectContaining({
          websites: ['https://example.com']
        })
      })
    )
    expect(
      pearpassVaultClient.activeVaultAdd.mock.calls[1][1].data.uris
    ).toBeUndefined()
    expect(
      pearpassVaultClient.activeVaultAdd.mock.calls[1][1].schema
    ).toBeUndefined()
  })

  it('should throw an error when activeVaultAdd fails', async () => {
    const record = {
      id: 'test-id',
      vaultId: 'test-vault-id',
      type: 'note',
      data: { title: 'n' }
    }

    const error = new Error('Failed to add record')
    pearpassVaultClient.activeVaultAdd.mockRejectedValueOnce(error)

    await expect(createRecord(record)).rejects.toThrow(error)
  })
})
