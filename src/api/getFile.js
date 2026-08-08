import { resolveFileKeyPreferV2 } from '../compat/recordSchema'
import { pearpassVaultClient } from '../instances'

/**
 * Prefer record-v2 file key; fall back to record/ when missing.
 * @param {string} key
 */
export const vaultGetFile = async (key) => {
  if (!key) {
    throw new Error('Key is required to get a file')
  }

  const { primary, fallback } = resolveFileKeyPreferV2(key)

  try {
    const res = await pearpassVaultClient.activeVaultGetFile(primary)
    if (res !== null && res !== undefined) {
      return res
    }
  } catch {
    // fall through to v1
  }

  if (fallback && fallback !== primary) {
    return pearpassVaultClient.activeVaultGetFile(fallback)
  }

  return pearpassVaultClient.activeVaultGetFile(primary)
}
