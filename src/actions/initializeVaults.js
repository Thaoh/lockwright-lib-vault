import { createAsyncThunk } from '@reduxjs/toolkit'

import { init } from '../api/init'
import { listVaults } from '../api/listVaults'
import { pearpassVaultClient } from '../instances'
import { logger } from '../utils/logger'
import { runActionScan } from './../api/actionRunner'

export const initializeVaults = createAsyncThunk(
  'vaults/initializeVaults',
  async ({ ciphertext, nonce, salt, hashedPassword, password }) => {
    await init({
      ciphertext,
      nonce,
      salt,
      hashedPassword,
      password
    })

    const vaults = await listVaults()

    // Join after the first list. Hyperswarm construct + join() share the
    // worklet with listVaults; awaiting flushed() used to stall unlock.
    safeStartPersonalSwarm()
    runActionScan().catch(() => {})

    return vaults
  }
)

const safeStartPersonalSwarm = () => {
  if (typeof pearpassVaultClient?.personalSwarmInit !== 'function') return
  Promise.resolve(pearpassVaultClient.personalSwarmInit()).catch((err) => {
    logger.error('initializeVaults: personalSwarmInit failed', { err })
  })
}
