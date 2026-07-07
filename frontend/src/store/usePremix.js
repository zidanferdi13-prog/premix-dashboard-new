import { useContext } from 'react'
import { PremixContext } from './PremixContext'

export function usePremix() {
  const context = useContext(PremixContext)
  if (!context) {
    throw new Error('usePremix must be used within a PremixProvider')
  }
  return context
}
