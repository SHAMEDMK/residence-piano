import { useMemo, useState } from 'react'
import SyndicModeContext from './SyndicModeContext'

function SyndicModeProvider({ children }) {
  const [syndicMode, setSyndicMode] = useState(false)
  const value = useMemo(
    () => ({ syndicMode, setSyndicMode }),
    [syndicMode],
  )

  return (
    <SyndicModeContext.Provider value={value}>
      {children}
    </SyndicModeContext.Provider>
  )
}

export default SyndicModeProvider
