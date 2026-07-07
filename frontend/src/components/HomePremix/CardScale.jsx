import { CheckCircle } from 'lucide-react'
import './CardScale.css'
import { usePremix } from '../../store/usePremix'
import { addTransactionPlant } from '../../services/api'
import toast from 'react-hot-toast'

export function CardScale({ variant, label, range, weight, material, target, statusText, cycle }) {
  const pct = target ? Math.min((parseFloat(weight) / parseFloat(target)) * 100, 100) : 0

  const {
    currentRm,
    moData,
    nextRm,
    setFlashSuccess,
    flashSuccess,
    allDone,
  } = usePremix()

  const handleConfirm = async () => {
    if (!currentRm || !target) return
    const weightNum = Number(weight)
    const targetNum = Number(target)

    if (!Number.isFinite(weightNum) || !Number.isFinite(targetNum) || targetNum <= 0) {
      toast.error('Target atau weight tidak valid')
      return
    }

    const withinTolerance = Math.abs(weightNum - targetNum) / targetNum <= 0.10
    if (!withinTolerance) {
      toast.error('Berat tidak sesuai target (±10%)')
      return
    }

    try {
      await addTransactionPlant({
        premix_temp_detail_id: currentRm.premix_temp_detail_id,
        t_mo_id: moData?.data?.t_mo_id,
        product_nrm: currentRm.product_nrm,
        qty: weightNum,
        sequence: '1',
      })
      setFlashSuccess(true)
      setTimeout(() => setFlashSuccess(false), 1500)
      nextRm()
    } catch (err) {
      toast.error('Gagal mengirim data')
    }
  }

  return (
    <div className={`cs-panel cs-panel--${variant} ${flashSuccess ? 'cs-panel--success' : ''}`}>
      <div className="cs-panel-header">
        <div className="cs-header-left">
          <span className={`cs-label cs-label--${variant}`}>{label}</span>
          <span className="cs-range">{range}</span>
        </div>
      </div>

      <div className="cs-material-label">— {material ?? 'Bahan Material'} —</div>

      <div className="cs-weight-area">
        <div className="cs-weight-display">
          <span className={`cs-digits cs-digits--${variant}`}>
            {weight}
          </span>
          <span className="cs-unit">kg</span>
        </div>
      </div>

      <div className="cs-target-row">
        <span className="cs-target-label">TARGET</span>
        <span className="cs-target-dash">—</span>
        <span className="cs-target-value">
          {target ? `${parseFloat(target).toFixed(2)} kg` : '— kg'}
        </span>
      </div>

      <div className="cs-progress-track">
        <div
          className={`cs-progress-fill cs-progress-fill--${variant}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="cs-panel-footer">
        <span className="cs-footer-status">{allDone ? 'Semua RM Selesai' : (statusText ?? 'Menunggu data...')}</span>
        <button
          className="cs-confirm-btn"
          onClick={handleConfirm}
          disabled={!currentRm || allDone}
        >
          <CheckCircle size={13} />
          Confirm
        </button>
      </div>
    </div>
  )
}
