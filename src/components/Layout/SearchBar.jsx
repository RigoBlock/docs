import './SearchBar.scss'
import { Index } from 'elasticlunr'
import { navigateTo } from 'gatsby-link'
import React, { useEffect, useRef, useState } from 'react'
import qs from 'qs'

export const SEARCH_URL = '/search'
export const MINIMUM_QUERY_LENGTH = 3

let index

const SearchBar = ({ location, searchIndex, prevUrl, setResults }) => {
  const index = getOrCreateIndex(searchIndex)
  const isSearchPage = () => !!location.pathname.match(SEARCH_URL)
  const useQuery = (queryParam, previousUrl) => {
    const [query, setQuery] = useState('')
    let previousQuery = queryParam

    const handleChange = e => {
      const query = e.target.value
      setQuery(query)
      if (previousQuery && !query && previousUrl) {
        navigateTo(previousUrl)
      }
      previousQuery = query
      if (query.length >= MINIMUM_QUERY_LENGTH) {
        let from = location.pathname
        if (previousUrl) {
          from = previousUrl
        }
        if (isSearchPage() && !previousUrl) {
          from = ''
        }
        const params = qs.stringify({ q: query, from })
        navigateTo(`${SEARCH_URL}?${params}`)
      }
    }

    return [query, setQuery, handleChange]
  }

  const searchEl = useRef(null)
  const { q: queryParam } = qs.parse(location.search, {
    ignoreQueryPrefix: true
  })
  const [query, setQuery, handleChange] = useQuery(queryParam, prevUrl)
  let placeHolderContent = 'Search'
  let searchIcon = query ? null : <i className="fas fa-search" />
  if (isSearchPage() && queryParam) {
    placeHolderContent = ''
    searchIcon = null
  }

  // only on first mount, check if we are on search page, place focus on search bar
  // and add url query value to address bar if there is one
  useEffect(
    () => {
      if (isSearchPage()) {
        searchEl.current.focus()
        if (queryParam && !query) {
          setQuery(queryParam)
        }
      } else {
        setQuery('')
      }
    },
    [location.pathname]
  )

  useEffect(
    () => {
      if (isSearchPage() && query && query.length >= MINIMUM_QUERY_LENGTH) {
        const results = index
          .search(query, {
            fields: {
              title: { boost: 2 },
              content: { boost: 1 }
            },
            expand: true
          })
          .map(({ ref }) => index.documentStore.getDoc(ref))
        setResults(results)
      }
    },
    [query, location.pathname]
  )
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-bar"
        ref={searchEl}
        placeholder={placeHolderContent}
        value={query}
        onChange={handleChange}
      />
      {searchIcon}
    </div>
  )
}

const getOrCreateIndex = searchIndex => {
  if (!index) {
    // Create an elastic lunr index and hydrate with graphql query results
    index = Index.load(searchIndex.index)
  }
  return index
}

export default SearchBar
