import './Navigation.scss'
import Link from 'gatsby-link'
import React from 'react'

const Navigation = ({ contents }) => {
  const sorted = contents.sort((a, b) => {
    const val1 = a.title === 'API reference' ? 100 : a.title.length
    const val2 = b.title === 'API reference' ? 100 : b.title.length
    return val1 - val2
  })
  const links = sorted.map((obj, index) => {
    const { title } = obj
    const sorted = obj.documents.sort()
    const to = sorted[0].entry.childMarkdownRemark.fields.slug
    return (
      <Link key={index} className="nav-link" to={to}>
        {title.toUpperCase()}
      </Link>
    )
  })
  return <div className="nav-container">{links}</div>
}

export default Navigation
