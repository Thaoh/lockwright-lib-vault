import { vaultGetFile } from './getFile'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultGetFile: jest.fn()
  }
}))

describe('getFile', () => {
  const mockResponse = { data: 'file-content' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw an error if key is not provided', async () => {
    await expect(vaultGetFile()).rejects.toThrow(
      'Key is required to get a file'
    )
    await expect(vaultGetFile(null)).rejects.toThrow(
      'Key is required to get a file'
    )
    await expect(vaultGetFile('')).rejects.toThrow(
      'Key is required to get a file'
    )
  })

  it('prefers record-v2 file key when given a v1 key', async () => {
    pearpassVaultClient.activeVaultGetFile.mockResolvedValue(mockResponse)
    await vaultGetFile('record/rec1/file/f1')
    expect(pearpassVaultClient.activeVaultGetFile).toHaveBeenCalledWith(
      'record-v2/rec1/file/f1'
    )
  })

  it('falls back to v1 when v2 miss', async () => {
    pearpassVaultClient.activeVaultGetFile
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(mockResponse)

    const result = await vaultGetFile('record/rec1/file/f1')
    expect(result).toBe(mockResponse)
    expect(pearpassVaultClient.activeVaultGetFile).toHaveBeenNthCalledWith(
      1,
      'record-v2/rec1/file/f1'
    )
    expect(pearpassVaultClient.activeVaultGetFile).toHaveBeenNthCalledWith(
      2,
      'record/rec1/file/f1'
    )
  })

  it('should return the response from pearpassVaultClient.activeVaultGetFile', async () => {
    pearpassVaultClient.activeVaultGetFile.mockResolvedValue(mockResponse)
    const result = await vaultGetFile('record-v2/rec1/file/f1')
    expect(result).toBe(mockResponse)
  })

  it('should propagate errors when both keys fail', async () => {
    const error = new Error('Network error')
    pearpassVaultClient.activeVaultGetFile
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
    await expect(vaultGetFile('record/rec1/file/f1')).rejects.toThrow(
      'Network error'
    )
  })
})
