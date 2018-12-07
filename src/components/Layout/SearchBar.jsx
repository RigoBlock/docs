import './SearchBar.scss'
import { Index } from 'elasticlunr'
import { navigateTo } from 'gatsby-link'
import React, { useEffect, useRef, useState } from 'react'

let index

const SearchBar = props => {
  const index = getOrCreateIndex(props)
  const searchEl = useRef(null)
  const [query, setQuery, handleChange] = useQuery()
  const searchValue =
    window.location.search && window.location.search.split('q=').pop()

  useEffect(() => {
    if (window.location.pathname.match('/search')) {
      searchEl.current.focus()
      if (searchValue && !query) {
        setQuery(searchValue)
      }
    }
  }, [])

  useEffect(
    () => {
      if (searchValue && searchValue.length >= 3) {
        const results = index
          .search(searchValue, {
            title: { boost: 2 },
            content: { boost: 1 }
          })
          .map(({ ref }) => index.documentStore.getDoc(ref))
        props.setResults(results)
      }
    },
    [query]
  )

  return (
    <input
      type="text"
      className="search"
      ref={searchEl}
      placeholder="Search"
      value={query}
      onChange={handleChange}
    />
  )
}

const useQuery = () => {
  const [query, setQuery] = useState('')

  const handleChange = e => {
    const query = e.target.value
    setQuery(query)
    if (query.length >= 3) {
      navigateTo('/search?q=' + query)
    }
  }

  return [query, setQuery, handleChange]
}

const getOrCreateIndex = props => {
  if (!index) {
    // Create an elastic lunr index and hydrate with graphql query results
    index = Index.load(props.searchIndex.index)
  }
  return index
}

export default SearchBar
