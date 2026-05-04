import { Bell, User, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/':            'Dashboard',
  '/produksi':    'Produksi',
  '/bahan-baku':  'Bahan Baku',
  '/formula':     'Formula Premix',
  '/laporan':     'Laporan',
  '/pengaturan':  'Pengaturan',
}

function Header() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'Dashboard'

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="header-search">
          <Search size={16} className="header-search-icon" />
          <input
            type="text"
            placeholder="Cari..."
            className="header-search-input"
          />
        </div>

        <button className="header-icon-btn" aria-label="Notifikasi">
          <Bell size={20} />
          <span className="header-badge">3</span>
        </button>

        <div className="header-user">
          <div className="header-user-avatar">
            <User size={16} />
          </div>
          <div className="header-user-info">
            <span className="header-user-name">Admin</span>
            <span className="header-user-role">Operator</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
