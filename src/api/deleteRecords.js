import { recordKeyV1, recordKeyV2 } from '../compat/recordSchema'
import { pearpassVaultClient } from '../instances'

/**
 * @param {Array<string>} recordIds
 * @returns {Promise<void>}
 */
export const deleteRecords = async (recordIds) => {
  if (!recordIds?.length) {
    throw new Error('Record IDs is required')
  }

  await Promise.all(
    recordIds.flatMap((recordId) => [
      pearpassVaultClient.activeVaultRemove(recordKeyV2(recordId)),
      pearpassVaultClient.activeVaultRemove(recordKeyV1(recordId))
    ])
  )
}
