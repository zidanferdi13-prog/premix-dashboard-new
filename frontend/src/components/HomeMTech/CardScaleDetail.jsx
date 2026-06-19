import { FlaskConical } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useMo } from '../../store/MoContext'
import './CardScaleDetail.css'

export function CardScaleDetail() {
    const { moNumber, moData, historyData } = useMo()
    const [rows, setRows] = useState([])

    const productPriority = useMemo(
        () => ({
            'WAN Kapur 200 mesh (CaCO3) Curah': 1,
            'WAN Semen Abu-abu OPC Tipe I-Curah': 2
        }),
        []
    )

    const formatNumber = (val) => {
        const num = Number(val)
        if (!Number.isFinite(num)) return '-'
        return num.toLocaleString('id-ID', {
            minimumFractionDigits: Number.isInteger(num) ? 0 : 1,
            maximumFractionDigits: 1
        })
    }

    const toProductLabel = (name = '') => {
        if (name.includes('Kapur')) return 'Kapur'
        if (name.includes('Semen')) return 'Semen'
        return name || '-'
    }

    useEffect(() => {
        if (!moNumber) {
            setRows([])
            return
        }

        const historyRows = Array.isArray(historyData?.data) ? historyData.data : []

        if (historyRows.length > 0) {
            const mapped = historyRows
                .map((item) => ({
                    product_nrm: item.product_nrm,
                    qty_plan: item.qty_plan,
                    qty_actual: item.qty_actual,
                    sequence: item.sequence
                }))
                .sort((a, b) => {
                    const pa = productPriority[a.product_nrm] || 99
                    const pb = productPriority[b.product_nrm] || 99
                    return pa - pb
                })

            setRows(mapped)
            return
        }

        const detail = Array.isArray(moData?.data?.detail) ? moData.data.detail : []
        const fallback = detail
            .filter((item) => productPriority[item.product_nrm])
            .sort((a, b) => productPriority[a.product_nrm] - productPriority[b.product_nrm])
            .map((item) => ({
                product_nrm: item.product_nrm,
                qty_plan: item.qty_plan,
                qty_actual: null,
                sequence: null
            }))

        setRows(fallback)
    }, [moNumber, moData, historyData, productPriority])

    return (
        <section className="csd-panel">
            <header className="csd-header">
                <h3 className="csd-title">
                    <FlaskConical size={17} />
                    Scale Detail
                </h3>
                <span className="csd-badge">MO DETAIL</span>
            </header>

            {rows.length === 0 ? (
                <div className="csd-empty">Belum ada detail transaksi untuk MO aktif.</div>
            ) : (
                <div className="csd-table-wrap">
                    <table className="csd-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Plan</th>
                                <th>Actual</th>
                                <th>Sequence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, idx) => (
                                <tr key={`${row.product_nrm}-${idx}`}>
                                    <td>{toProductLabel(row.product_nrm)}</td>
                                    <td>{formatNumber(row.qty_plan)}</td>
                                    <td>{formatNumber(row.qty_actual)}</td>
                                    <td>{row.sequence ?? '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
