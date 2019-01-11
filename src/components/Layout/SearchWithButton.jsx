import './SearchWithButton.scss'
import { navigateTo } from 'gatsby-link'
import Button from './Button'
import React, { useState } from 'react'
import qs from 'qs'

export const SEARCH_URL = '/search'

const SearchBarWithButton = () => {
  const [query, handleChange, handleClick, handleKeypress] = useQuery()

  return (
    <div className="search-bar-button-container">
      <input
        type="text"
        className="search-bar-button"
        placeholder="Search"
        value={query}
        onChange={handleChange}
        onKeyPress={handleKeypress}
      />
      <Button
        className="search-button"
        onClick={handleClick}
        onKeyPress={e => console.log(e)}
      >
        <i className="fas fa-search" />
      </Button>
    </div>
  )
}

const useQuery = () => {
  const [query, setQuery] = useState('')

  const handleClick = () => {
    const params = qs.stringify({ q: query, from: '/' })
    navigateTo(`${SEARCH_URL}?${params}`)
  }

  const handleChange = e => {
    const query = e.target.value
    setQuery(query)
  }

  const handleKeypress = e => (e.charCode === 13 ? handleClick() : null)

  return [query, handleChange, handleClick, handleKeypress]
}

export default SearchBarWithButton
