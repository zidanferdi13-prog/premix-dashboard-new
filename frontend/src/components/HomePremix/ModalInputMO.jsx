import { X, Search } from 'lucide-react'
import { useState } from 'react'
import { usePremix } from '../../store/usePremix'
import './ModalInputMO.css'

export function ModalInputMO() {
  const { popupOpen, closePopup, setActiveMo, loading } = usePremix()
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)

  if (!popupOpen) return null

  const handleSubmit = async () => {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('Nomor MO tidak boleh kosong')
      return
    }

    setError(null)
    setLocalLoading(true)
    try {
      const result = await setActiveMo(trimmed)
      if (!result?.success) {
        setError(result?.message || 'MO tidak ditemukan')
        return
      }
      setValue('')
      closePopup()
    } catch {
      setError('Gagal mencari MO')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const isBusy = loading || localLoading

  return (
    <div className="premix-modal-backdrop">
      <div className="premix-modal-card">
        <button className="premix-modal-close" onClick={closePopup} aria-label="Tutup">
          <X size={18} />
        </button>
        <h2>Tidak ada MO Aktif</h2>
        <p>Weight terdeteksi. Silakan isi nomor MO untuk melanjutkan premix.</p>

        <input
          className="premix-modal-input"
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null) }}
          onKeyDown={handleKeyDown}
          placeholder="Ketik nomor MO..."
          disabled={isBusy}
          autoFocus
        />

        <button
          className="premix-modal-submit"
          onClick={handleSubmit}
          disabled={isBusy || !value.trim()}
        >
          <Search size={14} />
          {isBusy ? 'Mencari...' : 'Submit MO'}
        </button>

        {error && <div className="premix-modal-error">{error}</div>}
      </div>
    </div>
  )
}
