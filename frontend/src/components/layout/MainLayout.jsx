import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { SidebarProvider } from '../../store/SidebarContext'
import { Toaster } from 'react-hot-toast'

function MainLayout() {
  return (
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
  )
}

export default MainLayout

