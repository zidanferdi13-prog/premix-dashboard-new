import { PackageOpen, RefreshCw, RotateCcw, Trash2, CheckCircle, Search } from 'lucide-react'
import './CardActiveMo.css'
import { useEffect, useRef, useState } from 'react';
import { useMo } from '../../store/MoContext';
import { resetDataWeight, endProcesWeight, findOneWeight } from '../../services/api';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../constants';
import { getMO } from '../../services/api';

export function CardActiveMo() {
    const { moNumber, moData, historyData, loading, searchMo, fetchTodayMo, clearMo } = useMo();
    const [inputValue, setInputValue] = useState('');
    const [localError, setLocalError] = useState(null);
    const [loadingMO, setLoadingMO] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);
    const [loadingConfirm, setLoadingConfirm] = useState(false);
    const inputRef = useRef(null);

    // ── Refresh: reload halaman penuh ─────────────────────────────
    const handleRefresh = () => window.location.reload();

    // ── Refresh MO: update data MO dari server ─────────────────────
    const handleRefreshMO = async () => {
        // if (!moNumber) { toast.error('Tidak ada MO aktif'); return; }
        setLoadingMO(true);
        const toastId = toast.loading('Memuat data MO...');
        try {
            await getMO();
            toast.success('Data MO berhasil diperbarui', { id: toastId });
        } catch {
            toast.error('Gagal memperbarui data MO', { id: toastId });
        } finally {
            setLoadingMO(false);
        }
    };

    // ── Reset ALL: kosongkan data timbang di server & UI ───────────
    const handleReset = async () => {
        const t_mo_id = moData?.data?.t_mo_id;
        const detail = moData?.data?.detail;
        if (!t_mo_id || !detail?.length) {
            toast.error('Tidak ada data timbang untuk direset');
            return;
        }
        setLoadingReset(true);
        const toastId = toast.loading('Mereset data timbang...');
        try {
            await resetDataWeight(t_mo_id);
            clearMo();
            toast.success('Data timbang berhasil direset', { id: toastId });
        } catch {
            toast.error('Gagal mereset data timbang', { id: toastId });
        } finally {
            setLoadingReset(false);
        }
    };

    // ── Confirm: tutup proses, print struk, clear data ─────────────
    const handleConfirm = async () => {
        const t_mo_id = moData?.data?.t_mo_id;
        const detail = historyData?.data;
        if (!detail?.length) {
            toast.error('Data masih kosong, silahkan timbang terlebih dahulu.', { duration: 6000 });
            return;
        }
        setLoadingConfirm(true);
        try {
            await endProcesWeight(t_mo_id);

            const response = await toast.promise(findOneWeight(t_mo_id), {
                loading: 'Memproses data...',
                success: 'Berhasil mendapatkan data.',
                error: 'Terjadi kesalahan!',
            });

            if (response.status !== 200) {
                toast.error('Gagal mendapatkan data.');
                return;
            }

            // sort by produk_name asc, waktu asc (ganti _.orderBy)
            const sortedData = [...(response.data.data.products || [])].sort((a, b) => {
                if (a.produk_name < b.produk_name) return -1;
                if (a.produk_name > b.produk_name) return 1;
                return new Date(a.waktu) - new Date(b.waktu);
            });

            const filter_data = sortedData.filter(
                (item) => Number(item.qty?.toString().replace(',', '.').trim()) > 0
            );

            // tambah seq per produk
            let lastProduct = null;
            let seq = 0;
            const filteredWithSeq = filter_data.map((item) => {
                if (item.produk_name === lastProduct) {
                    seq += 1;
                } else {
                    seq = 1;
                    lastProduct = item.produk_name;
                }
                return { ...item, seq };
            });

            const newData = { ...response.data.data, products: filteredWithSeq };

            const kapur = newData.products
                .filter((item) => item.produk_name === 'WAN Kapur 200 mesh (CaCO3) Curah')
                .reduce((total, item) => total + Number(item.qty), 0);
            const pasir = newData.products
                .filter((item) => item.produk_name === 'WAN Semen Abu-abu OPC Tipe I-Curah')
                .reduce((total, item) => total + Number(item.qty), 0);

            const seq_semen = newData.products.filter(
                (item) => item.produk_name === 'WAN Semen Abu-abu OPC Tipe I-Curah'
            );
            const seq_kapur = newData.products.filter(
                (item) => item.produk_name !== 'WAN Semen Abu-abu OPC Tipe I-Curah'
            );

            const printContents = `
            <div id="print-area" style="font-size:10px; font-family: monospace">
            <div>
                <div style="font-weight:bold; font-size:15px;">************************</div>
                <div style="font-weight:bold; font-size:15px;">${newData.nomor_mo}</div>
                <div style="font-size:15px;font-weight:bold;">${newData.product_name}</div>
                <div style="display:flex; gap:20px;">
                    <div style="font-weight:bold; width:50%; font-size:15px;">START</div>
                    <div style="font-weight:bold; width:50%; font-size:15px;">: ${newData.start}</div>
                </div>
                <div style="display:flex; gap:32px;">
                    <div style="font-weight:bold; width:50%; font-size:15px;">END</div>
                    <div style="font-weight:bold; width:50%; font-size:15px;">: ${newData.end}</div>
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
            </div>`;

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
            </html>`;

            // const printing = await fetch(`${API_BASE_URL}/print`, {
            const printing = await fetch(`http://192.168.5.21:3000/print`, {
                method: 'POST',
                headers: { 'Content-Type': 'text/html' },
                body: html,
            });

            if (!printing.ok) {
                toast.error('Gagal Print ... !');
            } else {
                clearMo();
                toast.success('Berhasil Print ...');
            }
        } catch (error) {
            console.log(error, '<>ERROR<>');
            toast.error('Terjadi kesalahan!');
        } finally {
            setLoadingConfirm(false);
        }
    };

    useEffect(() => {
        fetchTodayMo();
    }, []);

    const handleSearch = async () => {
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        setLocalError(null);
        const result = await searchMo(trimmed);
        if (result.success) {
            setInputValue('');
            // console.log('MO ditemukan, nomor:', result.moNumber);
            // console.log('MO data:', result.data);
        } else {
            setLocalError(result.message);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

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
                                onChange={(e) => { setInputValue(e.target.value); setLocalError(null); }}
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
                <button className="cam-btn cam-btn--confirm" onClick={handleConfirm} disabled={loadingConfirm}>
                    <CheckCircle size={13} />
                    {loadingConfirm ? 'Memproses...' : 'Confirm'}
                </button>
            </div>
        </div>
    )
}