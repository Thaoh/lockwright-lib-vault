import { isMatchOnlyChange } from './isMatchOnlyChange'

const baseLogin = (uris, extra = {}) => ({
  id: 'rec1',
  type: 'login',
  version: 1,
  vaultId: 'v1',
  folder: null,
  isFavorite: false,
  createdAt: 1,
  updatedAt: 2,
  data: {
    title: 'Example',
    username: 'user',
    password: 'secret',
    note: '',
    uris,
    websites: uris.map((u) => u.uri),
    ...extra
  }
})

describe('isMatchOnlyChange', () => {
  test('true when only uri match differs', () => {
    const prev = baseLogin([{ uri: 'https://a.com', match: 'baseDomain' }])
    const next = {
      ...baseLogin([{ uri: 'https://a.com', match: 'host' }]),
      updatedAt: 99
    }
    expect(isMatchOnlyChange(prev, next)).toBe(true)
  })

  test('false when website/uri list changes', () => {
    const prev = baseLogin([{ uri: 'https://a.com', match: 'baseDomain' }])
    const next = baseLogin([
      { uri: 'https://a.com', match: 'baseDomain' },
      { uri: 'https://b.com', match: 'baseDomain' }
    ])
    expect(isMatchOnlyChange(prev, next)).toBe(false)
  })

  test('false when password changes', () => {
    const prev = baseLogin([{ uri: 'https://a.com', match: 'baseDomain' }])
    const next = baseLogin([{ uri: 'https://a.com', match: 'baseDomain' }], {
      password: 'other'
    })
    expect(isMatchOnlyChange(prev, next)).toBe(false)
  })

  test('false when previous missing', () => {
    expect(
      isMatchOnlyChange(
        null,
        baseLogin([{ uri: 'https://a.com', match: 'baseDomain' }])
      )
    ).toBe(false)
  })
})
