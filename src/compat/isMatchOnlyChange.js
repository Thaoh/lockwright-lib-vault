import { projectRecordToV1 } from './projectRecordToV1'
import { deepEqualJson } from './recordSchema'
import { toAppRecord } from './toAppRecord'

/**
 * Projectable snapshot used for match-only detection (ignores updatedAt).
 * @param {object} record
 * @returns {object}
 */
const projectableSnapshot = (record) => {
  const asApp = toAppRecord(record)
  const projected = projectRecordToV1(asApp)
  const { updatedAt: _updatedAt, ...rest } = projected
  return rest
}

/**
 * True when only uri match fields (or other non-projectable v2 fields) differ —
 * i.e. the v1 projection would be unchanged aside from updatedAt.
 * @param {object|null|undefined} previousRecord
 * @param {object|null|undefined} nextRecord
 * @returns {boolean}
 */
export const isMatchOnlyChange = (previousRecord, nextRecord) => {
  if (!previousRecord || typeof previousRecord !== 'object') return false
  if (!nextRecord || typeof nextRecord !== 'object') return false

  return deepEqualJson(
    projectableSnapshot(previousRecord),
    projectableSnapshot(nextRecord)
  )
}
