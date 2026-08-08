import { deleteRecords } from './deleteRecords'
import { pearpassVaultClient } from '../instances'

describe('deleteRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('removes both record-v2 and record keys', async () => {
    const recordIds = ['record-123']

    await deleteRecords(recordIds)

    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledTimes(2)
    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledWith(
      'record-v2/record-123'
    )
    expect(pearpassVaultClient.activeVaultRemove).toHaveBeenCalledWith(
      'record/record-123'
    )
  })

  it('should throw an error if activeVaultRemove fails', async () => {
    const recordIds = ['record-456']
    const error = new Error('Failed to delete record')
    pearpassVaultClient.activeVaultRemove.mockRejectedValueOnce(error)

    await expect(deleteRecords(recordIds)).rejects.toThrow(error)
  })

  it('should throw an error if recordIds is not provided', async () => {
    await expect(deleteRecords()).rejects.toThrow('Record IDs is required')
  })
})
