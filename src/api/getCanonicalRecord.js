import { recordKeyV1, recordKeyV2 } from '../compat/recordSchema'
import { pearpassVaultClient } from '../instances'

const isPresentRecord = (record) =>
  record !== null &&
  record !== undefined &&
  typeof record === 'object' &&
  Object.keys(record).length > 0

/**
 * Prefer record-v2/; fall back to record/ when missing.
 * @param {string} recordId
 */
export const getCanonicalRecord = async (recordId) => {
  if (!recordId) {
    throw new Error('Record id is required to get a record')
  }

  try {
    const v2 = await pearpassVaultClient.activeVaultGet(recordKeyV2(recordId))
    if (isPresentRecord(v2)) {
      return v2
    }
  } catch {
    // fall through to v1
  }

  const v1 = await pearpassVaultClient.activeVaultGet(recordKeyV1(recordId))
  return isPresentRecord(v1) ? v1 : null
}
