import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import HomeMTech from '../pages/HomeMTech/HomeMTech'
import LaporanPage from '../pages/LaporanPage/LaporanPage'
import NotFoundPage from '../pages/NotFoundPage'
import { MoProvider } from '../store/MoContext'

function AppRoutes() {
  return (
    <BrowserRouter>
      <MoProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomeMTech />} />
            <Route path="/laporan" element={<LaporanPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MoProvider>
    </BrowserRouter>
  )
}

export default AppRoutes
