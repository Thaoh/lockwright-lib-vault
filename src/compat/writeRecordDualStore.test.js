import { writeRecordDualStore } from './writeRecordDualStore'
import { pearpassVaultClient } from '../instances'

describe('writeRecordDualStore', () => {
  const record = {
    id: 'test-id',
    vaultId: 'test-vault-id',
    type: 'login',
    data: {
      title: 'Example',
      websites: ['https://example.com']
    }
  }

  it('resolves when v2 write succeeds and v1 projection fails twice', async () => {
    pearpassVaultClient.activeVaultAdd
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))

    await expect(writeRecordDualStore(record)).resolves.toBeUndefined()
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(3)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenNthCalledWith(
      1,
      'record-v2/test-id',
      expect.objectContaining({ id: 'test-id', schema: 2 })
    )
  })

  it('throws when the v2 write fails', async () => {
    const error = new Error('Failed to add record')
    pearpassVaultClient.activeVaultAdd.mockRejectedValueOnce(error)

    await expect(writeRecordDualStore(record)).rejects.toThrow(error)
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledTimes(1)
  })
})
