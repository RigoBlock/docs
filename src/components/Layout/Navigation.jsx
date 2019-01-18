import './Navigation.scss'
import Link from 'gatsby-link'
import React from 'react'

const Navigation = ({ contents }) => {
  const links = contents.map((obj, index) => {
    const { title } = obj
    const to = obj.documents[0].title
    return (
      <Link key={index} className="nav-link" to={`/${to}`}>
        {title.toUpperCase()}
      </Link>
    )
  })
  return <div className="nav-container">{links}</div>
}

export default Navigation
