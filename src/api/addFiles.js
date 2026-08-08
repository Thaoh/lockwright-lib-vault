import { fileKeyV1, fileKeyV2 } from '../compat/recordSchema'
import { pearpassVaultClient } from '../instances'

/**
 * @param {{recordId: string, fileId: string, buffer: ArrayBuffer, name: string}[]} files
 */
export const vaultAddFiles = async (files) => {
  if (!files?.length) {
    throw new Error('Files are required')
  }

  for (const { recordId, fileId, buffer, name } of files) {
    await pearpassVaultClient.activeVaultAddFile(
      fileKeyV2(recordId, fileId),
      buffer,
      name
    )
    try {
      await pearpassVaultClient.activeVaultAddFile(
        fileKeyV1(recordId, fileId),
        buffer,
        name
      )
    } catch {
      await pearpassVaultClient.activeVaultAddFile(
        fileKeyV1(recordId, fileId),
        buffer,
        name
      )
    }
  }
}
