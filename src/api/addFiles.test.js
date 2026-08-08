import { vaultAddFiles } from './addFiles'
import { pearpassVaultClient } from '../instances'

jest.mock('../instances', () => ({
  pearpassVaultClient: {
    activeVaultAddFile: jest.fn()
  }
}))

describe('addFiles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw an error if files is undefined', async () => {
    await expect(vaultAddFiles()).rejects.toThrow('Files are required')
  })

  it('should throw an error if files is an empty array', async () => {
    await expect(vaultAddFiles([])).rejects.toThrow('Files are required')
  })

  it('dual-writes file keys under record-v2 and record', async () => {
    const files = [
      {
        recordId: 'rec1',
        fileId: 'file1',
        buffer: new ArrayBuffer(8),
        name: 'file1.txt'
      }
    ]
    pearpassVaultClient.activeVaultAddFile.mockResolvedValue({})

    await vaultAddFiles(files)

    expect(pearpassVaultClient.activeVaultAddFile).toHaveBeenCalledTimes(2)
    expect(pearpassVaultClient.activeVaultAddFile).toHaveBeenNthCalledWith(
      1,
      'record-v2/rec1/file/file1',
      files[0].buffer,
      'file1.txt'
    )
    expect(pearpassVaultClient.activeVaultAddFile).toHaveBeenNthCalledWith(
      2,
      'record/rec1/file/file1',
      files[0].buffer,
      'file1.txt'
    )
  })

  it('should propagate errors from pearpassVaultClient.activeVaultAddFile', async () => {
    const files = [
      {
        recordId: 'rec1',
        fileId: 'file1',
        buffer: new ArrayBuffer(8),
        name: 'file1.txt'
      }
    ]
    pearpassVaultClient.activeVaultAddFile.mockRejectedValue(
      new Error('Upload failed')
    )

    await expect(vaultAddFiles(files)).rejects.toThrow('Upload failed')
  })
})
