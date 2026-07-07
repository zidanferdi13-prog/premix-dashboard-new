import { PackageOpen, RefreshCw, RotateCcw, Trash2, Search } from 'lucide-react'
import './CardActiveMo.css'
import { useEffect, useRef, useState } from 'react'
import { usePremix } from '../../store/usePremix'
import { resetDataWeight, getMO } from '../../services/api'
import toast from 'react-hot-toast'

export function CardActiveMo() {
  const {
    moNumber,
    moData,
    loading,
    setActiveMo,
    clearMo,
  } = usePremix()

  const [inputValue, setInputValue] = useState('')
  const [localError, setLocalError] = useState(null)
  const [loadingMO, setLoadingMO] = useState(false)
  const [loadingReset, setLoadingReset] = useState(false)
  const inputRef = useRef(null)

  const handleRefresh = () => window.location.reload()

  const handleRefreshMO = async () => {
    setLoadingMO(true)
    const toastId = toast.loading('Memuat data MO...')
    try {
      await getMO()
      toast.success('Data MO berhasil diperbarui', { id: toastId })
    } catch {
      toast.error('Gagal memperbarui data MO', { id: toastId })
    } finally {
      setLoadingMO(false)
    }
  }

  const handleReset = async () => {
    const t_mo_id = moData?.data?.t_mo_id
    const detail = moData?.data?.detail
    if (!t_mo_id || !detail?.length) {
      toast.error('Tidak ada data timbang untuk direset')
      return
    }

    setLoadingReset(true)
    const toastId = toast.loading('Mereset data timbang...')
    try {
      await resetDataWeight(t_mo_id)
      clearMo()
      toast.success('Data timbang berhasil direset', { id: toastId })
    } catch {
      toast.error('Gagal mereset data timbang', { id: toastId })
    } finally {
      setLoadingReset(false)
    }
  }

  useEffect(() => {
    inputRef.current?.focus()
  }, [moNumber])

  const handleSearch = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    setLocalError(null)
    const result = await setActiveMo(trimmed)
    if (result.success) {
      setInputValue('')
      return
    }
    setLocalError(result.message || 'MO tidak ditemukan')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="cam-panel">
      <div className="cam-info">
        {moNumber ? (
          <span className="cam-label-notactive">
            <PackageOpen size={13} />
            MO ACTIVE
            <span className="cam-mo-number">{moNumber}</span>
          </span>
        ) : (
          <span className="cam-label">
            <PackageOpen size={13} />
            MO NoT Active
            <div className="cam-input-row">
              <input
                ref={inputRef}
                className={`cam-mo-input${localError ? ' cam-mo-input--error' : ''}`}
                type="text"
                placeholder="Ketik nomor MO..."
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setLocalError(null) }}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                className="cam-btn cam-btn--search"
                onClick={handleSearch}
                disabled={loading || !inputValue.trim()}
              >
                <Search size={13} />
                {loading ? 'Mencari...' : 'Cari'}
              </button>
              {localError && <span className="cam-input-error">{localError}</span>}
            </div>
          </span>
        )}
      </div>

      <div className="cam-actions">
        <button className="cam-btn cam-btn--refresh" onClick={handleRefresh}>
          <RefreshCw size={13} />
          Refresh
        </button>
        <button className="cam-btn cam-btn--refresh-mo" onClick={handleRefreshMO} disabled={loadingMO}>
          <RotateCcw size={13} />
          {loadingMO ? 'Memuat...' : 'Refresh MO'}
        </button>
        <button className="cam-btn cam-btn--reset" onClick={handleReset} disabled={loadingReset}>
          <Trash2 size={13} />
          {loadingReset ? 'Mereset...' : 'Reset ALL'}
        </button>
      </div>
    </div>
  )
}
