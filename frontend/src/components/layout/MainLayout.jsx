import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { SidebarProvider } from '../../store/SidebarContext'
import { MoProvider } from '../../store/MoContext'
import { Toaster } from 'react-hot-toast'

function MainLayout() {
  return (
    <MoProvider>
    <SidebarProvider>
      <Toaster position="top-right" />
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
    </MoProvider>
  )
}

export default MainLayout

