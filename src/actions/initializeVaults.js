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

    // Join in the background. swarm.join().flushed() has no timeout;
    // awaiting it left the unlock spinner up until DHT announce finished.
    safeStartPersonalSwarm()
    runActionScan().catch(() => {})

    return listVaults()
  }
)

const safeStartPersonalSwarm = () => {
  if (typeof pearpassVaultClient?.personalSwarmInit !== 'function') return
  Promise.resolve(pearpassVaultClient.personalSwarmInit()).catch((err) => {
    logger.error('initializeVaults: personalSwarmInit failed', { err })
  })
}
