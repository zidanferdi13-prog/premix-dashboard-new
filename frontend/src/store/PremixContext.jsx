import { createContext, useMemo, useState } from 'react'
import { nomorMO } from '../services/api'
import toast from 'react-hot-toast'

const normalizeDetail = (detail = []) => Array.isArray(detail) ? detail : []

export const PremixContext = createContext(null)

export function PremixProvider({ children }) {
  const [popupOpen, setPopupOpen] = useState(false)
  const [moNumber, setMoNumber] = useState(null)
  const [moData, setMoData] = useState(null)
  const [rmList, setRmList] = useState([])
  const [currentRmIndex, setCurrentRmIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [flashSuccess, setFlashSuccess] = useState(false)

  const currentRm = useMemo(() => rmList[currentRmIndex] ?? null, [rmList, currentRmIndex])
  const allDone = useMemo(() => currentRmIndex >= rmList.length, [currentRmIndex, rmList.length])

  const openPopup = () => setPopupOpen(true)
  const closePopup = () => setPopupOpen(false)

  const setActiveMo = async (nomor) => {
    const trimmed = nomor?.trim()
    if (!trimmed) return { success: false, message: 'Nomor MO kosong' }
    setLoading(true)
    try {
      const response = await nomorMO({ nomor: trimmed })
      if (response.status === 200 && response.data) {
        const detail = normalizeDetail(response.data?.data?.detail)
        setMoNumber(trimmed)
        setMoData(response.data)
        setRmList(detail)
        setCurrentRmIndex(0)
        if (!detail.length) {
          toast.error('Tidak ada detail RM')
        }
        return { success: true, data: response.data }
      }
      return { success: false, message: 'MO tidak ditemukan' }
    } catch {
      return { success: false, message: 'Gagal mencari MO' }
    } finally {
      setLoading(false)
    }
  }

  const clearMo = () => {
    setPopupOpen(false)
    setMoNumber(null)
    setMoData(null)
    setRmList([])
    setCurrentRmIndex(0)
    setLoading(false)
    setConfirmLoading(false)
    setFlashSuccess(false)
  }

  const nextRm = () => {
    setCurrentRmIndex((prev) => prev + 1)
    setFlashSuccess(false)
  }

  return (
    <PremixContext.Provider
      value={{
        popupOpen,
        moNumber,
        moData,
        rmList,
        currentRmIndex,
        currentRm,
        allDone,
        loading,
        confirmLoading,
        flashSuccess,
        openPopup,
        closePopup,
        setMoNumber,
        setMoData,
        setRmList,
        setCurrentRmIndex,
        setLoading,
        setConfirmLoading,
        setFlashSuccess,
        setActiveMo,
        clearMo,
        nextRm,
      }}
    >
      {children}
    </PremixContext.Provider>
  )
}
