import { useEffect, useState, useRef } from 'react';
import { CardActiveMo } from '../../components/HomePremix/CardActiveMo'
import { CardScale } from '../../components/HomePremix/CardScale'
import { useMo } from '../../store/useMo'
import { MoProvider } from '../../store/MoContext'

function HomePremixInner() {
  const [newData, setNewData] = useState();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const WS_URL = "ws://192.168.5.16:8765";
    const RECONNECT_DELAY = 3000;
    const connect = () => {
      if (!isMounted.current) return;
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log("WebSocket connected");
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setNewData(data);
      };
      ws.onclose = () => {
        console.log(`WebSocket disconnected, reconnect dalam ${RECONNECT_DELAY / 1000}s...`);
        if (isMounted.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };
      ws.onerror = () => {
        ws.close();
      };
    };
    connect();
    return () => {
      isMounted.current = false;
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  const { moNumber, moData, historyData } = useMo();
  const [dataDetail, setDataDetail] = useState([]);
  const prevMoNumber = useRef(null);

  useEffect(() => {
    if (moNumber && historyData && !prevMoNumber.current) {
      const detail = moData?.data?.detail || null;
      setDataDetail(detail);
      console.log(detail,'datadetail')
      prevMoNumber.current = moNumber;
    }
  }, [moNumber, historyData]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="home-header">
        <CardActiveMo />
      </div>
      <div className="cs-wrapper">
        <CardScale
          variant="SMALL"
          label="SMALL"
          weight={newData?.GW1}
          cycle={newData?.BC1}
        // material={dataDetail?.[0]?.product_nrm}
        // target={dataDetail?.[0]?.qty_plan}
        // act_qty={historyData?.data?.[0]?.qty_actual}
        />
      </div>
    </div>
  )
}

export default function HomePremix() {
  return (
    <MoProvider>
      <HomePremixInner />
    </MoProvider>
  )
}
