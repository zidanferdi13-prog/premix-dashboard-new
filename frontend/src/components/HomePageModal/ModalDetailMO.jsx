import { useState, useEffect } from 'react'
import { FileText, X, Printer } from 'lucide-react'
import { findOneWeight } from '../../services/api'
import { API_BASE_URL } from '../../constants'
import toast from 'react-hot-toast'

// format ISO → "04/05/2026 16:20"
const formatDate = (iso) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

/**
 * Props:
 *   row      — object baris MO yang dipilih (atau null jika modal tutup)
 *   onClose  — callback untuk menutup modal
 */
export function ModalDetailMO({ row, onClose }) {
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState(null)
    const [detail,   setDetail]   = useState(null)
    const [printing, setPrinting] = useState(false)

    // Fetch detail setiap kali row berubah
    useEffect(() => {
        if (!row) return
        setLoading(true)
        setError(null)
        setDetail(null)

        findOneWeight(row.t_mo_id)
            .then((res) => {
                if (res.status !== 200) { setError('Gagal mengambil detail.'); return }
                const raw = res.data.data

                const sortedData = [...(raw.products || [])].sort((a, b) => {
                    if (a.produk_name < b.produk_name) return -1
                    if (a.produk_name > b.produk_name) return 1
                    return new Date(a.waktu) - new Date(b.waktu)
                })

                const filter_data = sortedData.filter(
                    item => Number(item.qty?.toString().replace(',', '.').trim()) > 0
                )

                let lastProduct = null, seq = 0
                const filteredWithSeq = filter_data.map(item => {
                    if (item.produk_name === lastProduct) seq += 1
                    else { seq = 1; lastProduct = item.produk_name }
                    return { ...item, seq }
                })

                setDetail({ ...raw, products: filteredWithSeq })
            })
            .catch(() => setError('Terjadi kesalahan saat mengambil detail.'))
            .finally(() => setLoading(false))
    }, [row])

    const handlePrint = async () => {
        if (!detail) return
        const { products, nomor_mo, product_name, start, end } = detail

        const kapur = products
            .filter(i => i.produk_name === 'WAN Kapur 200 mesh (CaCO3) Curah')
            .reduce((t, i) => t + Number(i.qty), 0)
        const pasir = products
            .filter(i => i.produk_name === 'WAN Semen Abu-abu OPC Tipe I-Curah')
            .reduce((t, i) => t + Number(i.qty), 0)
        const seq_semen = products.filter(i => i.produk_name === 'WAN Semen Abu-abu OPC Tipe I-Curah')
        const seq_kapur = products.filter(i => i.produk_name !== 'WAN Semen Abu-abu OPC Tipe I-Curah')

        const printContents = `
<div id="print-area" style="font-size:10px; font-family: monospace">
  <div>
    <div style="font-weight:bold; font-size:15px;">************************</div>
    <div style="font-weight:bold; font-size:15px;">${nomor_mo}</div>
    <div style="font-size:15px;font-weight:bold;">${product_name}</div>
    <div style="display:flex; gap:20px;">
      <div style="font-weight:bold; width:50%; font-size:15px;">START</div>
      <div style="font-weight:bold; width:50%; font-size:15px;">: ${start}</div>
    </div>
    <div style="display:flex; gap:32px;">
      <div style="font-weight:bold; width:50%; font-size:15px;">END</div>
      <div style="font-weight:bold; width:50%; font-size:15px;">: ${end}</div>
    </div>
    <div style="display:flex; gap:20px;">
      <div style="font-weight:bold; width:50%; font-size:15px;">TOT SEMEN</div>
      <div style="font-weight:bold; width:50%; font-size:15px;">: ${pasir} Kg</div>
    </div>
    <div style="display:flex; gap:20px;">
      <div style="font-weight:bold; width:50%; font-size:15px;">TOT KAPUR</div>
      <div style="font-weight:bold; width:50%; font-size:15px;">: ${kapur} Kg</div>
    </div>
    <div style="display:flex; gap:20px;">
      <div style="font-weight:bold; width:50%; font-size:15px;">SEQ SEMEN</div>
      <div style="font-weight:bold; width:50%; font-size:15px;">: ${seq_semen.length}</div>
    </div>
    <div style="display:flex; gap:20px;">
      <div style="font-weight:bold; width:50%; font-size:15px;">SEQ KAPUR</div>
      <div style="font-weight:bold; width:50%; font-size:15px;">: ${seq_kapur.length}</div>
    </div>
    <div style="font-weight:bold; font-size:15px;">************************</div>
  </div>
</div>`

        const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      @page { size: 80mm auto; margin: 5mm; }
      body { font-size: 14px; font-family: monospace; }
      .row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; }
    </style>
  </head>
  <body>${printContents}</body>
</html>`

        setPrinting(true)
        try {
            const res = await fetch(`${API_BASE_URL}/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/html' },
                body: html,
            })
            if (!res.ok) toast.error('Gagal Print ... !')
            else toast.success('Berhasil Print ...')
        } catch {
            toast.error('Gagal Print ... !')
        } finally {
            setPrinting(false)
        }
    }

    if (!row) return null

    return (
        <div className="lap-modal-overlay" onClick={onClose}>
            <div className="lap-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="lap-modal-header">
                    <div className="lap-modal-title">
                        <FileText size={16} />
                        <span>Detail MO</span>
                        <span className="lap-nomor" style={{ fontSize: 13 }}>{row.nomor_mo}</span>
                    </div>
                    <button className="lap-modal-close" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="lap-modal-body">
                    {loading && <div className="lap-state">Memuat detail...</div>}
                    {error   && <div className="lap-state" style={{ color: 'var(--color-danger)' }}>{error}</div>}

                    {!loading && !error && detail && (() => {
                        const { products, product_name, start, end } = detail
                        const kapur = products
                            .filter(i => i.produk_name === 'WAN Kapur 200 mesh (CaCO3) Curah')
                            .reduce((t, i) => t + Number(i.qty), 0)
                        const pasir = products
                            .filter(i => i.produk_name === 'WAN Semen Abu-abu OPC Tipe I-Curah')
                            .reduce((t, i) => t + Number(i.qty), 0)
                        const seq_semen = products.filter(i => i.produk_name === 'WAN Semen Abu-abu OPC Tipe I-Curah')
                        const seq_kapur = products.filter(i => i.produk_name !== 'WAN Semen Abu-abu OPC Tipe I-Curah')

                        return (
                            <>
                                {/* Info */}
                                <div className="lap-modal-info">
                                    <div className="lap-modal-info-item">
                                        <span className="lap-modal-info-label">Produk</span>
                                        <span className="lap-modal-info-val">{product_name}</span>
                                    </div>
                                    <div className="lap-modal-info-item">
                                        <span className="lap-modal-info-label">Start</span>
                                        <span className="lap-modal-info-val">{start || '-'}</span>
                                    </div>
                                    <div className="lap-modal-info-item">
                                        <span className="lap-modal-info-label">End</span>
                                        <span className="lap-modal-info-val">{end || '-'}</span>
                                    </div>
                                </div>

                                {/* Struk summary */}
                                <div className="lap-modal-struk">
                                    <div className="lap-modal-struk-row"><span>TOT SEMEN</span><span>{pasir} Kg</span></div>
                                    <div className="lap-modal-struk-row"><span>TOT KAPUR</span><span>{kapur} Kg</span></div>
                                    <div className="lap-modal-struk-row"><span>SEQ SEMEN</span><span>{seq_semen.length}</span></div>
                                    <div className="lap-modal-struk-row"><span>SEQ KAPUR</span><span>{seq_kapur.length}</span></div>
                                </div>

                                {/* Products table */}
                                <div className="lap-table-wrap">
                                    <table className="lap-table">
                                        <thead>
                                            <tr>
                                                <th>Seq</th>
                                                <th>Produk</th>
                                                <th>Qty (Kg)</th>
                                                <th>Waktu</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr><td colSpan={4}><div className="lap-empty">Belum ada data timbang</div></td></tr>
                                            ) : products.map((p, idx) => (
                                                <tr key={idx}>
                                                    <td>{p.seq}</td>
                                                    <td>{p.produk_name}</td>
                                                    <td>{Number(p.qty).toFixed(2)}</td>
                                                    <td>{p.waktu ? formatDate(p.waktu) : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )
                    })()}
                </div>

                {/* Footer */}
                <div className="lap-modal-footer">
                    <button className="lap-modal-btn-cancel" onClick={onClose}>
                        <X size={13} /> Tutup
                    </button>
                    <button
                        className="lap-modal-btn-print"
                        onClick={handlePrint}
                        disabled={printing || !detail}
                    >
                        <Printer size={13} />
                        {printing ? 'Mencetak...' : 'Print Struk'}
                    </button>
                </div>
            </div>
        </div>
    )
}
