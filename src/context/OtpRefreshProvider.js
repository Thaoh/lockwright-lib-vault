import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { useDispatch, useSelector } from 'react-redux'
import { shallowEqual } from 'react-redux'

import { OtpRefreshContext } from './OtpRefreshContext'
import { generateOtpCodesByIds } from '../api/generateOtpCodesByIds'
import { updateOtpCodes } from '../slices/otpSlice'
import { createAlignedInterval } from '../utils/createAlignedInterval'

export const OTP_WATCH_ALL = 'all'

const resolveWatchedIds = (watchers, otpRecordIds) => {
  const scopes = [...watchers.values()]
  if (scopes.includes(OTP_WATCH_ALL)) return otpRecordIds

  const wanted = new Set(
    scopes.filter((scope) => typeof scope === 'string' && scope.length > 0)
  )
  return otpRecordIds.filter((id) => wanted.has(id))
}

/**
 * Centralized OTP poller component.
 * Reads OTP record IDs from Redux, polls codes every second for
 * screens that called useOtpWatch, and dispatches results to the otp slice.
 */
const OtpPoller = ({ refreshRef, watchersRef, watchVersion }) => {
  const dispatch = useDispatch()

  const otpRecordIds = useSelector(
    (state) =>
      state.vault.data?.records?.filter((r) => r.otpPublic).map((r) => r.id) ??
      [],
    shallowEqual
  )

  const otpRecordIdsRef = useRef(otpRecordIds)
  otpRecordIdsRef.current = otpRecordIds

  const refresh = useCallback(async () => {
    const ids = resolveWatchedIds(watchersRef.current, otpRecordIdsRef.current)
    if (!ids.length) return

    try {
      const results = await generateOtpCodesByIds(ids)
      dispatch(updateOtpCodes(results))
    } catch {
      // Will retry on next tick
    }
  }, [dispatch, watchersRef])

  useEffect(() => {
    if (refreshRef) refreshRef.current = refresh
    return () => {
      if (refreshRef) refreshRef.current = null
    }
  }, [refreshRef, refresh])

  const watchedIds = resolveWatchedIds(watchersRef.current, otpRecordIds)
  const watchedKey = watchedIds.join(',')

  useEffect(() => {
    if (!watchedKey) return

    refresh()
    return createAlignedInterval(refresh)
  }, [watchedKey, refresh, watchVersion])

  return null
}

/**
 * Provider that manages centralized OTP polling.
 * Place above all components that consume OTP data via useRecords/useRecordById.
 * Codes generate only while a child calls useOtpWatch.
 */
export const OtpRefreshProvider = ({ children }) => {
  const refreshRef = useRef(null)
  const watchersRef = useRef(new Map())
  const nextWatchId = useRef(0)
  const [watchVersion, setWatchVersion] = useState(0)

  const register = useCallback((scope) => {
    const key = ++nextWatchId.current
    watchersRef.current.set(key, scope)
    setWatchVersion((version) => version + 1)
    return () => {
      watchersRef.current.delete(key)
      setWatchVersion((version) => version + 1)
    }
  }, [])

  const value = useMemo(() => ({ refreshRef, register }), [register])

  return createElement(
    OtpRefreshContext.Provider,
    { value },
    createElement(OtpPoller, { refreshRef, watchersRef, watchVersion }),
    children
  )
}
