import './SearchResults.scss'
import Link from 'gatsby-link'
import React from 'react'

const SearchResults = ({ data }) => (
  <div className="result-list">
    <ul>
      {data.map((res, index) => (
        <li key={index}>
          <Link to={res.to}>{res.title.toUpperCase()}</Link>
          <p>{res.excerpt}</p>
        </li>
      ))}
    </ul>
  </div>
)

export default SearchResults
