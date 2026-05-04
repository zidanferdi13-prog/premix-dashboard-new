import { Factory, PackageOpen, FlaskConical, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Total Produksi Hari Ini',  value: '12.400 kg', icon: Factory,      variant: 'orange' },
  { label: 'Bahan Baku Tersedia',       value: '84 item',   icon: PackageOpen,  variant: 'green'  },
  { label: 'Formula Aktif',             value: '27',        icon: FlaskConical, variant: 'blue'   },
  { label: 'Output Bulan Ini',          value: '310 ton',   icon: TrendingUp,   variant: 'red'    },
]

function HomePage() {
  return (
    <div>
      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon, variant }) => (
          <div key={label} className="stat-card">
            <div className={`stat-card-icon stat-card-icon--${variant}`}>
              <Icon size={22} />
            </div>
            <div>
              <div className="stat-card-value">{value}</div>
              <div className="stat-card-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <p className="panel-title">Aktivitas Produksi Terkini</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          Data produksi akan ditampilkan di sini.
        </p>
      </div>
    </div>
  )
}

export default HomePage
