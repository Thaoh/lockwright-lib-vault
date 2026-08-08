import { setBlockV1DeleteMirror } from '../../api/setBlockV1DeleteMirror'

// Peer-side: ensure vault-ext.blockV1DeleteMirror is set (idempotent).
// The emitter writes the durable flag before broadcasting; receivers
// re-apply so the gate survives swarm delivery gaps.
export const schemaMigrationWarningActionHandler = {
  execute: async () => {
    await setBlockV1DeleteMirror(true)
  }
}
