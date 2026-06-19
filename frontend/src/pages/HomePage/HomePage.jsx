import React from 'react'
import { Factory, FlaskConical } from 'lucide-react'
import ModuleCard from '../../components/HomePage/ModuleCard'
import './HomePage.css'

export default function HomePage() {
  return (
    <div className="home-page">
      <div className="home-page__header">
        <h1>Dashboard</h1>
        <p>Pilih module yang ingin dibuka</p>
      </div>
      <div className="home-page__cards">
        <ModuleCard
          title="M-Tech"
          subtitle="Monitoring berat & scaling — isi deskripsi disini"
          icon={<Factory size={40} />}
          to="/homemtech"
          bgClass="card-mtech"
        />
        <ModuleCard
          title="Premix"
          subtitle="Formulasi & mixing premix — isi deskripsi disini"
          icon={<FlaskConical size={40} />}
          to="/homepremix"
          bgClass="card-premix"
        />
      </div>
    </div>
  )
}
