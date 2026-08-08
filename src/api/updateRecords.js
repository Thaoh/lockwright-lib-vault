import { isMatchOnlyChange } from '../compat/isMatchOnlyChange'
import { writeRecordDualStore } from '../compat/writeRecordDualStore'

/**
 * Strip dual-store meta fields before persisting.
 * @param {object} record
 * @returns {{ clean: object, previousData: object|undefined, skipV1Projection: boolean }}
 */
const splitRecordMeta = (record) => {
  const { previousData, skipV1Projection, ...clean } = record
  return {
    clean,
    previousData,
    skipV1Projection: skipV1Projection === true
  }
}

/**
 * @param {Array<Object>} records - optional `previousData` (prior full record)
 *   enables match-only v1 skip; `skipV1Projection: true` forces skip.
 * @returns {Promise<void>}
 */
export const updateRecords = async (records) => {
  if (!records?.length) {
    throw new Error('Record is required')
  }

  await Promise.all(
    records.map(async (record) => {
      const { clean, previousData, skipV1Projection } = splitRecordMeta(record)
      const skipV1 =
        skipV1Projection ||
        (previousData !== undefined &&
          previousData !== null &&
          isMatchOnlyChange(previousData, clean))

      await writeRecordDualStore(clean, { skipV1 })
    })
  )
}
