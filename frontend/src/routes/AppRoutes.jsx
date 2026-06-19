import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import HomePage from '../pages/HomePage/HomePage'
import HomeMTech from '../pages/HomeMTech/HomeMTech'
import HomePremix from '../pages/HomePremix/HomePremix'
import LaporanPage from '../pages/LaporanPage/LaporanPage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/homemtech" element={<HomeMTech />} />
          <Route path="/homepremix" element={<HomePremix />} />
          <Route path="/laporan" element={<LaporanPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
