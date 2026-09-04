import { useState, useEffect } from 'react'

import { pearpassVaultClient } from '../instances'

const inFlight = new Map()
const resolved = new Map()

export const clearFaviconCache = () => {
  inFlight.clear()
  resolved.clear()
}

const loadFavicon = (url) => {
  const cached = resolved.get(url)
  if (cached) return Promise.resolve(cached)

  const pending = inFlight.get(url)
  if (pending) return pending

  const request = pearpassVaultClient.fetchFavicon(url).then(
    (res) => {
      inFlight.delete(url)
      if (res && res.favicon) {
        resolved.set(url, res)
      }
      return res
    },
    (err) => {
      inFlight.delete(url)
      throw err
    }
  )

  inFlight.set(url, request)
  return request
}

/**
 * Hook to fetch and manage favicon state for a given URL
 * @param {{ url: string }} params - Parameters object containing the URL
 * @returns {{
 *   faviconSrc: string | null,
 *   isLoading: boolean,
 *   hasError: boolean
 * }}
 */
export const useFavicon = (params) => {
  const { url } = params
  const [faviconSrc, setFaviconSrc] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!url) {
      setFaviconSrc(null)
      setIsLoading(false)
      setHasError(false)
      return
    }

    setIsLoading(true)
    setHasError(false)

    const apply = async () => {
      try {
        if (!pearpassVaultClient) {
          throw new Error('Pearpass vault client is not initialized')
        }

        const res = await loadFavicon(url)

        if (res && res.favicon) {
          setFaviconSrc(res.favicon)
          setHasError(false)
        } else {
          setFaviconSrc(null)
          setHasError(true)
        }
        setIsLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (!message.toLowerCase().includes('favicon not found')) {
          console.warn('Favicon fetch failed:', err)
        }
        setFaviconSrc(null)
        setHasError(true)
        setIsLoading(false)
      }
    }

    apply()
  }, [url])

  return { faviconSrc, isLoading, hasError }
}
