import { useContext } from 'react'
import { MoContext } from './MoContext'

export function useMo() {
    return useContext(MoContext)
}
