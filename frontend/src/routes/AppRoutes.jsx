import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
