import { CheckCircle } from 'lucide-react'
import './CardScale.css'
import { useMo } from '../../store/MoContext'
import { useEffect, useRef, useState } from 'react'
import { addTransactionPlant } from '../../services/api'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function formatWeight(val) {
  const num = parseFloat(val) || 0
  const int = Math.floor(num).toString().padStart(1, '0')
  const dec = (num % 1).toFixed(2).toString().padStart(4, '0') // includes the dot
  return { int, dec }
}

export function CardScale({ variant, label, range, weight, material, target, statusText, act_qty, cycle }) {
  const { int, dec } = formatWeight(weight)
  const pct = target ? Math.min((parseFloat(act_qty) / parseFloat(target)) * 100, 100) : 0

  const { moNumber, moData, searchMo } = useMo()
  const [statusTimbangan, setStatusTimbangan] = useState({})

  const prevCycle        = useRef(null)
  const lockRef          = useRef(false)
  const lastProcessedCycle = useRef(null)
  const latestWeight     = useRef(weight)

  // Selalu update latestWeight ke nilai terbaru tanpa trigger effect
  useEffect(() => {
    latestWeight.current = weight
  }, [weight])

  useEffect(() => {
    const cycleChanged = cycle !== undefined && cycle !== prevCycle.current
    prevCycle.current = cycle

    if (!moNumber) return console.log(`[${variant}] No active MO, skip proses cycle`)

    if (cycleChanged && weight > 0) {
      if (lockRef.current || lastProcessedCycle.current === cycle) {
        console.log(`[${variant}] Sedang proses atau cycle sudah diproses, skip (cycle: ${cycle})`)
        return
      }

      lockRef.current = true
      lastProcessedCycle.current = cycle

      ;(async () => {
        try {
          console.log(`[${variant}] Cycle berubah → ${cycle}, weight saat trigger:`, weight)
          console.log(`[${variant}] Tunggu 3000ms...`)
          setStatusTimbangan(prev => ({ ...prev, [variant]: 'Processing...' }))
          await sleep(3000)

          const finalWeight = latestWeight.current
          const premixId = moData?.data?.detail?.find(d => d.product_nrm === material)?.premix_temp_detail_id
          if (!premixId) {
            console.error(`[${variant}] Gagal temukan premix_temp_detail_id untuk material ${material}`)
            return
          }
          console.log(`[${variant}] Weight setelah 3 detik:`, finalWeight)
          console.log(`[${variant}] Data siap dikirim:`, {
            premix_temp_detail_id: premixId, // Asumsi cycle adalah ID detail premix
            t_mo_id: moData?.data?.t_mo_id,
            product_nrm: material,
            qty: finalWeight,
            sequence: '1'
          })
          // TODO: panggil addTransaction() di sini
          await addTransactionPlant({
            premix_temp_detail_id: premixId, // Asumsi cycle adalah ID detail premix
            t_mo_id: moData?.data?.t_mo_id,
            product_nrm: material,
            qty: finalWeight,
            sequence: '1'
          })

          console.log(`[${variant}] Transaksi berhasil dikirim ke backend`)
          setStatusTimbangan(prev => ({ ...prev, [variant]: 'Selesai' }))
          await searchMo(moNumber) // Refresh data MO setelah transaksi
        } catch (err) {
          console.error(`[${variant}] Error proses cycle:`, err)
        } finally {
          lockRef.current = false
        }
      })()
    }
  }, [cycle])

  return (
    <div className={`cs-panel cs-panel--${variant}`}>

      {/* Header */}
      <div className="cs-panel-header">
        <div className="cs-header-left">
          <span className={`cs-label cs-label--${variant}`}>{label}</span>
          <span className="cs-range">{range}</span>
        </div>
        <div className="cs-status-badge">
          <span className="cs-status-dot" />
          {statusTimbangan?.[variant] ?? 'GOYANG'}
        </div>
      </div>

      {/* Material */}
      <div className="cs-material-label">— {material ?? 'Bahan Material'} —</div>

      {/* Weight */}
      <div className="cs-weight-area">
        <div className="cs-weight-display">
          <span className={`cs-digits cs-digits--${variant}`}>
            {weight}
          </span>
          <span className="cs-unit">kg</span>
        </div>
      </div>

      {/* Target */}
      <div className="cs-target-row">
        <span className="cs-target-label">TARGET</span>
        <span className="cs-target-dash">—</span>
        <span className="cs-target-value">
          {target ? `${parseFloat(target).toFixed(2)} kg` : '— kg'}
        </span>
      </div>

      {/* Progress */}
      <div className="cs-progress-track">
        <div
          className={`cs-progress-fill cs-progress-fill--${variant}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Footer */}
      <div className="cs-panel-footer">
        <span className="cs-footer-status">{statusText ?? 'Menunggu data...'}</span>
        <button className="cs-confirm-btn">
          <CheckCircle size={13} />
          Konfirmasi
        </button>
      </div>

    </div>
  )
}

