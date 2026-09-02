import { projectRecordToV1 } from './projectRecordToV1'
import { recordKeyV1, recordKeyV2 } from './recordSchema'
import { toAppRecord } from './toAppRecord'
import { pearpassVaultClient } from '../instances'

/**
 * Write v2 first, then v1 projection. Retries v1 once on failure.
 * @param {object} record - storage record (meta fields stripped by caller)
 * @param {{ skipV1?: boolean }} [options]
 */
export const writeRecordDualStore = async (record, { skipV1 = false } = {}) => {
  const asV2 = toAppRecord(record)
  await pearpassVaultClient.activeVaultAdd(recordKeyV2(asV2.id), asV2)

  if (skipV1) return

  const projected = projectRecordToV1(asV2)
  try {
    await pearpassVaultClient.activeVaultAdd(recordKeyV1(asV2.id), projected)
  } catch {
    try {
      await pearpassVaultClient.activeVaultAdd(recordKeyV1(asV2.id), projected)
    } catch {
      // v2 is canonical. v1 is a projection for old readers. A v1 timeout
      // after a successful v2 write must not fail the save.
    }
  }
}
