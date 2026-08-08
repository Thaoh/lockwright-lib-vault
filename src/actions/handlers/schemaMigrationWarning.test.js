import { schemaMigrationWarningActionHandler } from './schemaMigrationWarning'
import { setBlockV1DeleteMirror } from '../../api/setBlockV1DeleteMirror'

jest.mock('../../api/setBlockV1DeleteMirror', () => ({
  setBlockV1DeleteMirror: jest.fn()
}))

describe('schemaMigrationWarningActionHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('sets blockV1DeleteMirror via vault-ext merge', async () => {
    setBlockV1DeleteMirror.mockResolvedValue({ blockV1DeleteMirror: true })

    await schemaMigrationWarningActionHandler.execute({
      type: 'schema-migration-warning',
      payload: { from: 1, to: 2 }
    })

    expect(setBlockV1DeleteMirror).toHaveBeenCalledWith(true)
  })
})
