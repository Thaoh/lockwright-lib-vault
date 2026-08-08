import { createAsyncThunk } from '@reduxjs/toolkit'

import { addDevice as addDeviceApi } from '../api/addDevice'
import { SCHEMA_V2 } from '../compat/recordSchema'
import { getCurrentDeviceName, pearpassVaultClient } from '../instances'
import { addDeviceFactory } from '../utils/addDeviceFactory'
import { logger } from '../utils/logger'

export const addDevice = createAsyncThunk(
  'vault/addDevice',
  async (_, { getState }) => {
    const state = getState()
    const vaultState = state.vault
    const vaultId = vaultState.data.id
    const existingDevices = vaultState.data?.devices ?? []

    const deviceName = getCurrentDeviceName()
    const writerKey = await pearpassVaultClient.activeVaultGetWriterKey()
    const masterTopic = await safeGetPersonalSwarmTopic()

    const existingDevice = existingDevices.find(
      (device) => device.writerKey === writerKey
    )

    const needsSchemaBump =
      existingDevice && Number(existingDevice.recordSchema) !== SCHEMA_V2

    if (
      existingDevice &&
      existingDevice.masterTopic === masterTopic &&
      !needsSchemaBump
    ) {
      logger.log('Device already added to vault')
      return existingDevice
    }

    const base = existingDevice
      ? { ...existingDevice, createdAt: Date.now() }
      : addDeviceFactory(deviceName, vaultId, writerKey, masterTopic)

    const device = { ...base, recordSchema: SCHEMA_V2 }
    if (masterTopic) device.masterTopic = masterTopic
    else delete device.masterTopic

    await addDeviceApi(device)

    return device
  }
)

const safeGetPersonalSwarmTopic = async () => {
  try {
    if (typeof pearpassVaultClient?.personalSwarmGetTopic !== 'function') {
      return null
    }
    return (await pearpassVaultClient.personalSwarmGetTopic()) || null
  } catch (err) {
    logger.error('addDevice: personalSwarmGetTopic failed', { err })
    return null
  }
}
