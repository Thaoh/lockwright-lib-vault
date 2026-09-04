import { RECORD_V2_PREFIX } from '../compat/recordSchema'
import { toAppRecord } from '../compat/toAppRecord'
import { pearpassVaultClient } from '../instances'

/**
 * @returns {Promise<Array<Object>>}
 */
export const listRecords = async () => {
  const records = await pearpassVaultClient.activeVaultList(RECORD_V2_PREFIX, {
    includeOtpCodes: false
  })

  return (records ?? []).map((record) => toAppRecord(record))
}
