import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Factory,
  PackageOpen,
  FlaskConical,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useSidebar } from '../../store/SidebarContext'

const menuItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'      },
  // { to: '/produksi',    icon: Factory,         label: 'Produksi'       },
  // { to: '/bahan-baku',  icon: PackageOpen,     label: 'Bahan Baku'     },
  // { to: '/formula',     icon: FlaskConical,    label: 'Formula Premix' },
  { to: '/laporan',     icon: BarChart3,       label: 'Laporan'        },
  // { to: '/pengaturan',  icon: Settings,        label: 'Pengaturan'     },
]

function Sidebar() {
  const { collapsed, toggle } = useSidebar()

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <Factory size={24} className="sidebar-brand-icon" />
        {!collapsed && (
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">WAN Factory</span>
            <span className="sidebar-brand-sub">IoT Dashboard</span>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        className="sidebar-toggle"
        onClick={toggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Perlebar' : 'Perkecil'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!collapsed && <p className="sidebar-section-label">MENU UTAMA</p>}
        {menuItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-item${isActive ? ' sidebar-item--active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="sidebar-item-icon" />
            {!collapsed && (
              <>
                <span className="sidebar-item-label">{label}</span>
                <ChevronRight size={14} className="sidebar-item-arrow" />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <span>v1.0.0</span>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

