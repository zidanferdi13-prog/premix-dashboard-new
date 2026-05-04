// Format tanggal ke format Indonesia
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Format angka ke format Rupiah
export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
