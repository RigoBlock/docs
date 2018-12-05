import './SearchResults.scss'
import Link from 'gatsby-link'
import React from 'react'

const SearchResults = ({ searchResults, isActive = false }) => (
  <div className="result-list">
    <span>Results:</span>
    <ul>
      {searchResults.map((res, index) => (
        <li key={index}>
          <Link to={res.to}>{res.title}</Link>
        </li>
      ))}
    </ul>
  </div>
)

export default SearchResults
