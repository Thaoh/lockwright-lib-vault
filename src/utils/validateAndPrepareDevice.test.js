import { validateAndPrepareDevice } from './validateAndPrepareDevice'

describe('validateAndPrepareDevice', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should throw error for invalid device', () => {
    const mockDevice = {
      id: 'test-id-123',
      type: 'login',
      name: 'ios',
      createdAt: 1234567890
    }

    expect(() => validateAndPrepareDevice(mockDevice)).toThrow(
      'Invalid device data'
    )
  })

  test('should validate and prepare valid device', () => {
    const mockDevice = {
      id: 'test-id-123',
      vaultId: 'vault-456',
      name: 'ios',
      createdAt: 1234567890
    }

    const result = validateAndPrepareDevice(mockDevice)

    expect(result).toEqual({
      id: 'test-id-123',
      vaultId: 'vault-456',
      name: 'ios',
      createdAt: 1234567890
    })
  })

  test('preserves recordSchema and unknown fields', () => {
    const mockDevice = {
      id: 'test-id-123',
      vaultId: 'vault-456',
      name: 'ios',
      createdAt: 1234567890,
      recordSchema: 2,
      features: { uris: true },
      peerHint: 'keep-me'
    }

    const result = validateAndPrepareDevice(mockDevice)

    expect(result).toEqual(mockDevice)
    expect(result.recordSchema).toBe(2)
    expect(result.features).toEqual({ uris: true })
    expect(result.peerHint).toBe('keep-me')
  })
})
