import { createContext, useRef, useState } from 'react'
import { findMoPlant, nomorMO, refreshDataWeight } from '../services/api'
import moment from 'moment'

export const MoContext = createContext(null)

export function MoProvider({ children }) {
    const [moData, setMoData] = useState(null)   // full response.data
    const [moNumber, setMoNumber] = useState(null)   // string nomor MO
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [historyData, setHistoryData] = useState(null) // data history MO
    const hasFetched = useRef(false)  // pastikan fetch hanya sekali

    const fetchTodayMo = async () => {
        // Kalau sudah ada data atau sedang/sudah fetch, stop
        if (moNumber || hasFetched.current) return
        hasFetched.current = true
        setLoading(true)
        setError(null)
        try {
            const today = moment().format('YYYY-MM-DD')
            const response = await findMoPlant(today)
            if (response.status === 200 && response.data?.moNumber) {
                setMoNumber(response.data.moNumber)
                setMoData(response.data)
            }
        } catch (err) {
            setError('Gagal memuat data MO')
            hasFetched.current = false  // boleh retry kalau error
        } finally {
            setLoading(false)
        }
    }

    const searchMo = async (nomor) => {
        const trimmed = nomor?.trim()
        if (!trimmed) return { success: false, message: 'Nomor MO kosong' }
        setLoading(true)
        setError(null)
        try {
            const response = await nomorMO({ nomor: trimmed })
            if (response.status === 200 && response.data) {
                setMoNumber(trimmed)
                setMoData(response.data)
                console.log("data MO", response.data)
                const t_mo_id = response.data?.data?.t_mo_id
                if (t_mo_id) {
                    await historyMO(t_mo_id)  // langsung fetch detail MO setelah dapat nomor
                }
                return { success: true, moNumber: trimmed, data: response.data }
            } else {
                const msg = 'MO tidak ditemukan'
                setError(msg)
                return { success: false, message: msg }
            }
        } catch (err) {
            const msg = 'Gagal mencari MO'
            setError(msg)
            return { success: false, message: msg }
        } finally {
            setLoading(false)
        }
    }

    const historyMO = async (t_mo_id) => {
        const trimmed = t_mo_id?.trim()
        if (!trimmed) return { success: false, message: 'Nomor MO kosong' }
        setLoading(true)
        setError(null)
        try {
            const response = await refreshDataWeight(trimmed)
            if (response.status === 200 && response.data) {
                setHistoryData(response.data)
                console.log('History MO data:', response.data);
                return { success: true, data: response.data }
            } else {
                const msg = 'MO tidak ditemukan'
                setError(msg)
                return { success: false, message: msg }
            }
        } catch (err) {
            const msg = 'Gagal mencari MO'
            setError(msg)
            return { success: false, message: msg }
        } finally {
            setLoading(false)
        }
    }

    const clearMo = () => {
        setMoNumber(null)
        setMoData(null)
        setError(null)
    }

    return (
        <MoContext.Provider value={{ moData, moNumber, historyData, loading, error, fetchTodayMo, searchMo, historyMO, clearMo }}>
            {children}
        </MoContext.Provider>
    )
}
