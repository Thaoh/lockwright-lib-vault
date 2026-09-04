import { initializeVaults } from './initializeVaults'
import { init } from '../api/init'
import { listVaults } from '../api/listVaults'
import { pearpassVaultClient } from '../instances'

jest.mock('../api/init', () => ({
  init: jest.fn()
}))

jest.mock('../api/listVaults', () => ({
  listVaults: jest.fn()
}))

describe('initializeVaults', () => {
  let dispatch
  let getState

  beforeEach(() => {
    jest.clearAllMocks()
    dispatch = jest.fn()
    getState = jest.fn()

    init.mockResolvedValue(undefined)
    listVaults.mockResolvedValue([])
  })

  it('should initialize with the provided password', async () => {
    const password = 'test-password'
    const thunk = initializeVaults({ password })
    await thunk(dispatch, getState)

    expect(init).toHaveBeenCalledWith({ password })
  })

  it('should initialize with the provided encryption fields', async () => {
    const ciphertext = 'test-ciphertext'
    const nonce = 'test-nonce'
    const salt = 'test-salt'
    const hashedPassword = 'test-decryption-key'

    const thunk = initializeVaults({ ciphertext, nonce, salt, hashedPassword })
    await thunk(dispatch, getState)

    expect(init).toHaveBeenCalledWith({
      ciphertext,
      nonce,
      salt,
      hashedPassword
    })
  })

  it('should list vaults after initialization', async () => {
    const thunk = initializeVaults('password')
    await thunk(dispatch, getState)

    expect(listVaults).toHaveBeenCalled()
    const initCallIndex = init.mock.invocationCallOrder[0]
    const listVaultsCallIndex = listVaults.mock.invocationCallOrder[0]
    expect(initCallIndex).toBeLessThan(listVaultsCallIndex)
  })

  it('should return the vaults from listVaults', async () => {
    const mockVaults = [{ id: 'vault-1' }, { id: 'vault-2' }]
    listVaults.mockResolvedValue(mockVaults)

    const thunk = initializeVaults('password')
    const result = await thunk(dispatch, getState)

    expect(result.payload).toEqual(mockVaults)
  })

  it('should handle errors during initialization', async () => {
    const errorMessage = 'Initialization failed'
    init.mockRejectedValue(new Error(errorMessage))

    const thunk = initializeVaults('password')
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(initializeVaults.rejected.type)
    expect(result.error.message).toContain(errorMessage)
    expect(listVaults).not.toHaveBeenCalled()
  })

  it('should handle errors during vault listing', async () => {
    const errorMessage = 'Listing failed'
    listVaults.mockRejectedValue(new Error(errorMessage))

    const thunk = initializeVaults('password')
    const result = await thunk(dispatch, getState).catch((e) => e)

    expect(result.type).toBe(initializeVaults.rejected.type)
    expect(result.error.message).toContain(errorMessage)
  })

  it('must not wait for personalSwarmInit before listing vaults', async () => {
    listVaults.mockResolvedValue([{ id: 'vault-1' }])
    pearpassVaultClient.personalSwarmInit.mockReturnValue(new Promise(() => {}))

    const thunk = initializeVaults({ password: 'pw' })
    const result = await Promise.race([
      thunk(dispatch, getState),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(new Error('initializeVaults waited on personalSwarmInit')),
          100
        )
      )
    ])

    expect(result.payload).toEqual([{ id: 'vault-1' }])
    expect(listVaults).toHaveBeenCalled()
    expect(pearpassVaultClient.personalSwarmInit).toHaveBeenCalled()
  })

  it('starts personal swarm only after listVaults returns', async () => {
    let resolveList
    listVaults.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve
      })
    )

    const thunk = initializeVaults({ password: 'pw' })
    const pending = thunk(dispatch, getState)

    await Promise.resolve()
    expect(pearpassVaultClient.personalSwarmInit).not.toHaveBeenCalled()

    resolveList([{ id: 'vault-1' }])
    const result = await pending

    expect(result.payload).toEqual([{ id: 'vault-1' }])
    expect(pearpassVaultClient.personalSwarmInit).toHaveBeenCalled()
  })
})
