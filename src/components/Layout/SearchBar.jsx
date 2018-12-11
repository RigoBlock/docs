import './SearchBar.scss'
import { Index } from 'elasticlunr'
import { navigateTo } from 'gatsby-link'
import React, { useEffect, useRef, useState } from 'react'
import qs from 'qs'

export const SEARCH_URL = '/search'
export const MINIMUM_QUERY_LENGTH = 3

let index

const SearchBar = props => {
  const index = getOrCreateIndex(props)
  const searchEl = useRef(null)
  const { q: queryParam, from } = qs.parse(
    typeof window !== 'undefined' && window.location.search,
    {
      ignoreQueryPrefix: true
    }
  )
  const [query, setQuery, handleChange] = useQuery(from)

  // only on first mount, check if we are on search page, place focus on search bar
  // and add url query value to address bar if there is one
  useEffect(() => {
    if (isSearchPage()) {
      searchEl.current.focus()
      if (from) {
        props.setPrevUrl(from)
      }
      if (queryParam && !query) {
        setQuery(queryParam)
      }
    }
  }, [])

  useEffect(
    () => {
      if (queryParam && queryParam.length >= MINIMUM_QUERY_LENGTH) {
        const results = index
          .search(queryParam, {
            fields: {
              title: { boost: 2 },
              content: { boost: 1 }
            },
            expand: true
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
      className="search-bar"
      ref={searchEl}
      placeholder="Search"
      value={query}
      onChange={handleChange}
    />
  )
}

const isSearchPage = () =>
  typeof window !== 'undefined' && window.location.pathname.match(SEARCH_URL)

const useQuery = prevUrl => {
  const [query, setQuery] = useState('')

  const handleChange = e => {
    const query = e.target.value
    setQuery(query)
    if (query.length >= MINIMUM_QUERY_LENGTH) {
      let from
      if (prevUrl) {
        from = prevUrl
      } else if (isSearchPage() && !prevUrl) {
        from = ''
      } else {
        from = typeof window !== 'undefined' && window.location.pathname
      }
      const params = qs.stringify({ q: query, from })
      navigateTo(`${SEARCH_URL}?${params}`)
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
