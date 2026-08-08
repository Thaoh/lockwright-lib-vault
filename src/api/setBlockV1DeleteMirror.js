import { VAULT_EXT_KEY } from '../compat/recordSchema'
import { pearpassVaultClient } from '../instances'

/**
 * Merge vault-ext.blockV1DeleteMirror (idempotent).
 * @param {boolean} [value=true]
 * @returns {Promise<object>} updated vault-ext document
 */
export const setBlockV1DeleteMirror = async (value = true) => {
  const current =
    (await pearpassVaultClient.activeVaultGet(VAULT_EXT_KEY)) || {}
  if (current.blockV1DeleteMirror === value) {
    return current
  }

  const next = {
    ...current,
    blockV1DeleteMirror: value
  }
  await pearpassVaultClient.activeVaultAdd(VAULT_EXT_KEY, next)
  return next
}
