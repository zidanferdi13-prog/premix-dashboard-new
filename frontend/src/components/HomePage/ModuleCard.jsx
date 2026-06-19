import React from 'react'
import { Link } from 'react-router-dom'
import './ModuleCard.css'

export default function ModuleCard({ title, subtitle, icon, to, bgClass }) {
  return (
    <Link to={to} className={`module-card ${bgClass || ''}`}>
      <div className="module-card__icon">{icon}</div>
      <div className="module-card__body">
        <h2 className="module-card__title">{title}</h2>
        <p className="module-card__subtitle">{subtitle}</p>
      </div>
    </Link>
  )
}
