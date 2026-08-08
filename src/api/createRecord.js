import { writeRecordDualStore } from '../compat/writeRecordDualStore'

/**
 * @param {{
 *  id: string,
 *  vaultId: string,
 * }} record
 * @returns {Promise<void>}
 */
export const createRecord = async (record) => {
  await writeRecordDualStore(record)
}
