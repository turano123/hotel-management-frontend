import React from 'react'

export default function Header({ title, subtitle, right }) {
  return (
    <div className="page-heading">
      <div className="page-heading__titles">
        {subtitle && <div className="page-heading__subtitle">{subtitle}</div>}
        <h2 className="page-heading__title">{title}</h2>
      </div>
      {right ? <div className="page-heading__actions">{right}</div> : null}
    </div>
  )
}
