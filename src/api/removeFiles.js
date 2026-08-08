import { fileKeyV1, fileKeyV2 } from '../compat/recordSchema'
import { pearpassVaultClient } from '../instances'

/**
 * @param {{recordId: string, fileId: string}[]} files
 */
export const vaultRemoveFiles = async (files) => {
  if (!files?.length) {
    throw new Error('File keys are required')
  }

  await Promise.all(
    files.flatMap(({ recordId, fileId }) => [
      pearpassVaultClient.activeVaultRemoveFile(fileKeyV2(recordId, fileId)),
      pearpassVaultClient.activeVaultRemoveFile(fileKeyV1(recordId, fileId))
    ])
  )
}
