import { setBlockV1DeleteMirror } from './setBlockV1DeleteMirror'
import { pearpassVaultClient } from '../instances'

describe('setBlockV1DeleteMirror', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('merges vault-ext with blockV1DeleteMirror true', async () => {
    pearpassVaultClient.activeVaultGet.mockResolvedValueOnce({
      migratedToSchema: 2
    })
    pearpassVaultClient.activeVaultAdd.mockResolvedValueOnce()

    const result = await setBlockV1DeleteMirror(true)

    expect(pearpassVaultClient.activeVaultGet).toHaveBeenCalledWith('vault-ext')
    expect(pearpassVaultClient.activeVaultAdd).toHaveBeenCalledWith(
      'vault-ext',
      {
        migratedToSchema: 2,
        blockV1DeleteMirror: true
      }
    )
    expect(result.blockV1DeleteMirror).toBe(true)
  })

  it('is idempotent when already set', async () => {
    pearpassVaultClient.activeVaultGet.mockResolvedValueOnce({
      blockV1DeleteMirror: true
    })

    await setBlockV1DeleteMirror(true)

    expect(pearpassVaultClient.activeVaultAdd).not.toHaveBeenCalled()
  })
})
