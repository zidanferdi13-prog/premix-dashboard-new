import { useState, useEffect } from 'react'
import { BarChart3, Search, Package, CheckCircle2, Clock, Weight, Eye } from 'lucide-react'
import { findMoPlant } from '../../services/api'
import { ModalDetailMO } from '../../components/HomeMTech/ModalDetailMO'
import './LaporanPage.css'

// format "2026-05-04T09:20:44.000Z" → "04/05/2026 16:20"
const formatDate = (iso) => {
    if (!iso) return '-'
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
        + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// "2026-05-04" format untuk input date
const toInputDate = (date) => date.toISOString().split('T')[0]

function LaporanPage() {
    const today = toInputDate(new Date())
    const [tanggal, setTanggal] = useState(today)
    const [data, setData]       = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError]     = useState(null)

    const fetchData = async (tgl) => {
        setLoading(true)
        setError(null)
        try {
            const res = await findMoPlant(tgl)
            setData(res?.data?.data || [])
        } catch {
            setError('Gagal mengambil data. Periksa koneksi atau coba lagi.')
            setData([])
        } finally {
            setLoading(false)
        }
    }

    // fetch otomatis saat pertama load & saat tanggal berubah via tombol
    useEffect(() => {
        fetchData(today)
    }, [])

    const handleCari = () => fetchData(tanggal)

    // ── Modal detail ───────────────────────────────────────────────
    const [selectedRow, setSelectedRow] = useState(null)

    // Summary
    const totalMO   = data.length
    const selesai   = data.filter(d => d.end_process !== null).length
    const proses    = data.filter(d => d.end_process === null).length
    const totalQty  = data.reduce((sum, d) => sum + Number(d.qty || 0), 0)

    return (
        <div className="lap-page">

            {/* ── Header + filter ── */}
            <div className="lap-header">
                <div className="lap-title">
                    <BarChart3 size={18} className="lap-title-icon" />
                    Laporan Harian Premix
                </div>
                <div className="lap-filter">
                    <label htmlFor="lap-date">Tanggal</label>
                    <input
                        id="lap-date"
                        type="date"
                        className="lap-date-input"
                        value={tanggal}
                        max={today}
                        onChange={(e) => setTanggal(e.target.value)}
                    />
                    <button className="lap-btn-fetch" onClick={handleCari} disabled={loading}>
                        <Search size={13} />
                        {loading ? 'Memuat...' : 'Cari'}
                    </button>
                </div>
            </div>

            {/* ── Summary cards ── */}
            <div className="lap-summary">
                <div className="lap-card">
                    <div className="lap-card-icon lap-card-icon--total"><Package size={18} /></div>
                    <div className="lap-card-info">
                        <span className="lap-card-value">{totalMO}</span>
                        <span className="lap-card-label">Total MO</span>
                    </div>
                </div>
                <div className="lap-card">
                    <div className="lap-card-icon lap-card-icon--done"><CheckCircle2 size={18} /></div>
                    <div className="lap-card-info">
                        <span className="lap-card-value">{selesai}</span>
                        <span className="lap-card-label">Selesai</span>
                    </div>
                </div>
                <div className="lap-card">
                    <div className="lap-card-icon lap-card-icon--process"><Clock size={18} /></div>
                    <div className="lap-card-info">
                        <span className="lap-card-value">{proses}</span>
                        <span className="lap-card-label">Dalam Proses</span>
                    </div>
                </div>
                <div className="lap-card">
                    <div className="lap-card-icon lap-card-icon--qty"><Weight size={18} /></div>
                    <div className="lap-card-info">
                        <span className="lap-card-value">{totalQty.toLocaleString('id-ID')}</span>
                        <span className="lap-card-label">Total Qty (zak)</span>
                    </div>
                </div>
            </div>

            {/* ── Tabel ── */}
            {loading ? (
                <div className="lap-state">Memuat data...</div>
            ) : error ? (
                <div className="lap-state" style={{ color: 'var(--color-danger)' }}>{error}</div>
            ) : (
                <div className="lap-table-panel">
                    <div className="lap-table-header">
                        <span className="lap-table-title">Detail MO</span>
                        <span className="lap-table-count">{totalMO} data</span>
                    </div>
                    <div className="lap-table-wrap">
                        <table className="lap-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nomor MO</th>
                                    <th>Produk</th>
                                    <th>Qty (zak)</th>
                                    <th>Dibuat</th>
                                    <th>Selesai</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7}>
                                            <div className="lap-empty">
                                                <BarChart3 size={32} className="lap-empty-icon" />
                                                <div>Tidak ada data untuk tanggal ini</div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    data.map((row, i) => (
                                        <tr key={row.premix_temp_id}>
                                            <td>{i + 1}</td>
                                            <td>
                                                <button className="lap-nomor-btn" onClick={() => setSelectedRow(row)}>
                                                    {row.nomor_mo}
                                                </button>
                                            </td>
                                            <td>{row.product_name}</td>
                                            <td>{Number(row.qty).toLocaleString('id-ID')}</td>
                                            <td>{row.dibuat}</td>
                                            <td>{row.end_process ? formatDate(row.end_process) : '-'}</td>
                                            <td>
                                                {row.end_process ? (
                                                    <span className="lap-badge lap-badge--done">
                                                        <CheckCircle2 size={11} /> Selesai
                                                    </span>
                                                ) : (
                                                    <span className="lap-badge lap-badge--process">
                                                        <Clock size={11} /> Proses
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="lap-btn-detail" onClick={() => setSelectedRow(row)}>
                                                    <Eye size={13} /> Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Modal Detail ── */}
            <ModalDetailMO
                row={selectedRow}
                onClose={() => setSelectedRow(null)}
            />
        </div>
    )
}

export default LaporanPage
