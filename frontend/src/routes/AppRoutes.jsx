import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import HomeMTech from '../pages/HomeMTech/HomeMTech'
import LaporanPage from '../pages/LaporanPage/LaporanPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeMTech />} />
          <Route path="/laporan" element={<LaporanPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
