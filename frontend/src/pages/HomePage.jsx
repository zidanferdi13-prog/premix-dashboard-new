import { useEffect, useState, useRef } from 'react';
import { CardActiveMo } from '../components/HomePageModal/CardActiveMo'
import { CardScale } from '../components/HomePageModal/CardScale'
import { CardScaleDetail } from '../components/HomePageModal/CardScaleDetail'
import { useMo } from '../store/MoContext'


function HomePage() {

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
                handleDataUpdate(data);
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

    const handleDataUpdate = (newData) => {
        setNewData(newData);
    }

    const keywords = [
        "WAN Semen Abu-abu OPC Tipe I-Curah",
        "WAN Kapur 200 mesh (CaCO3) Curah",
    ];

    const { moNumber, moData, historyData } = useMo();
    const [dataDetail, setDataDetail] = useState([]);
    const prevMoNumber = useRef(null);

    useEffect(() => {
        if (moNumber && historyData && !prevMoNumber.current) {
            const detail = moData?.data?.detail || null;
            const matchedItems = detail?.filter(item =>
                keywords.includes(item.product_nrm)
            ) || [];
            setDataDetail(matchedItems);
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
                    variant="kapur"
                    label="KAPUR"
                    weight={newData?.GW1}
                    cycle={newData?.BC1}
                    material={dataDetail?.[0]?.product_nrm}
                    target={dataDetail?.[0]?.qty_plan}
                    act_qty={historyData?.data?.[0]?.qty_actual}
                // statusText={newData?.status1}
                />

                <div className="cs-divider">
                    <span className="cs-vs">vs</span>
                </div>

                <CardScale
                    variant="semen"
                    label="SEMEN"
                    weight={newData?.GW2}
                    cycle={newData?.BC2}
                    material={dataDetail?.[1]?.product_nrm}
                    target={dataDetail?.[1]?.qty_plan}
                    act_qty={historyData?.data?.[1]?.qty_actual}
                // statusText={newData?.status2}
                />
            </div>

            <CardScaleDetail />
        </div>
    )
}

export default HomePage
