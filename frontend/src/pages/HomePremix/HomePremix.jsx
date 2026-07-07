import { useEffect, useRef, useState } from 'react'
import { CardActiveMo } from '../../components/HomePremix/CardActiveMo'
import { CardScale } from '../../components/HomePremix/CardScale'
import { ModalInputMO } from '../../components/HomePremix/ModalInputMO'
import { PremixProvider } from '../../store/PremixContext'
import { usePremix } from '../../store/usePremix'

function HomePremixInner() {
  const wsRef = useRef(null)
  const reconnectTimer = useRef(null)
  const isMounted = useRef(true)
  const [newData, setNewData] = useState({})

  const { moNumber, currentRm, openPopup } = usePremix()
  const moNumberRef = useRef(moNumber)

  // Always keep ref in sync with latest moNumber
  useEffect(() => {
    moNumberRef.current = moNumber
  }, [moNumber])

  useEffect(() => {
    isMounted.current = true
    const WS_URL = 'ws://192.168.5.16:8765'
    const RECONNECT_DELAY = 3000

    const connect = () => {
      if (!isMounted.current) return
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => console.log('WebSocket connected')

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        setNewData(data)

        // Auto-detect: weight changed AND no MO → show popup
        // Use ref to avoid stale closure
        if (!moNumberRef.current && Number(data?.GW1) > 0) {
          openPopup()
        }
      }

      ws.onclose = () => {
        console.log(`WebSocket disconnected, reconnect dalam ${RECONNECT_DELAY / 1000}s...`)
        if (isMounted.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
        }
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      isMounted.current = false
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <ModalInputMO />

      <div className="home-header">
        <CardActiveMo />
      </div>

      <div className="cs-wrapper">
        <CardScale
          variant="SMALL"
          label="SMALL"
          weight={newData?.GW1}
          material={currentRm?.product_nrm}
          target={currentRm?.qty_plan}
          cycle={newData?.BC1}
        />
      </div>
    </div>
  )
}

export default function HomePremix() {
  return (
    <PremixProvider>
      <HomePremixInner />
    </PremixProvider>
  )
}
