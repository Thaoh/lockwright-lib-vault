import { useContext, useEffect } from 'react'

import { OtpRefreshContext } from '../context/OtpRefreshContext'

/**
 * Ask the worklet to generate OTP codes while this component is mounted.
 * Pass `'all'` on the Authenticator screen. Pass a record id on a single
 * item that shows a code.
 *
 * @param {'all' | string | null | undefined} scope
 */
export const useOtpWatch = (scope) => {
  const ctx = useContext(OtpRefreshContext)

  useEffect(() => {
    if (!ctx?.register || scope === null || scope === undefined || scope === '')
      return undefined
    return ctx.register(scope)
  }, [ctx, scope])
}
