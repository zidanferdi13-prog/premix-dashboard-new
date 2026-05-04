import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { SidebarProvider } from '../../store/SidebarContext'

function MainLayout() {
  return (
    <SidebarProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="app-body">
          <Header />
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout

