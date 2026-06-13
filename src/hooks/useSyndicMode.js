import { useContext } from 'react'
import SyndicModeContext from '../context/SyndicModeContext'

function useSyndicMode() {
  const context = useContext(SyndicModeContext)

  if (!context) {
    throw new Error('useSyndicMode must be used inside SyndicModeProvider')
  }

  return context
}

export default useSyndicMode
