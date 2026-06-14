import { useEffect, useMemo, useState } from 'react'
import SyndicModeContext from './SyndicModeContext'

const THEME_STORAGE_KEY = 'residence-piano-theme'

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark'
    ? 'dark'
    : 'light'
}

function SyndicModeProvider({ children }) {
  const [isSyndic, setIsSyndic] = useState(false)
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(
    () => ({ isSyndic, setIsSyndic, theme, setTheme }),
    [isSyndic, theme],
  )

  return (
    <SyndicModeContext.Provider value={value}>
      {children}
    </SyndicModeContext.Provider>
  )
}

export default SyndicModeProvider
