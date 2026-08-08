import { broadcastAction } from './broadcastAction'
import { setBlockV1DeleteMirror } from './setBlockV1DeleteMirror'
import { ACTION_TYPES } from '../actions/types'

/**
 * Durable gate first, then broadcast SCHEMA_MIGRATION_WARNING to peers.
 * @param {object} [payload]
 */
export const emitSchemaMigrationWarning = async (payload = {}) => {
  await setBlockV1DeleteMirror(true)
  return broadcastAction({
    type: ACTION_TYPES.SCHEMA_MIGRATION_WARNING,
    payload
  })
}
