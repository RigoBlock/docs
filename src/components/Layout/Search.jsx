import './Search.scss'
import { Index } from 'elasticlunr'
import { navigateTo } from 'gatsby-link'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

let index

const Search = props => {
  const index = getOrCreateIndex(props)
  const query = useQuery(props.hook, index)
  const searchEl = useRef(null)
  const searchValue =
    window.location.search && window.location.search.split('q=').pop()

  useLayoutEffect(() => {
    if (window.location.pathname.match('/search')) {
      searchEl.current.focus()
    }
  })
  useEffect(
    () => {
      if (searchValue && searchValue.length >= 3) {
        const results = index
          .search(searchValue, {
            title: { boost: 2 },
            content: { boost: 1 }
          })
          .map(({ ref }) => index.documentStore.getDoc(ref))
        props.hook(results)
      }
    },
    [query.value]
  )

  return (
    <input
      type="text"
      className="search"
      ref={searchEl}
      placeholder="Search"
      value={query.value}
      onChange={query.onChange}
      // onClick={onClick}
    />
  )
}

const onClick = () =>
  window.location.pathname.match('/search') ? null : navigateTo('/search')

const getOrCreateIndex = props => {
  if (!index) {
    // Create an elastic lunr index and hydrate with graphql query results
    index = Index.load(props.searchIndex.index)
  }
  return index
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

  return {
    value: query,
    onChange: handleChange,
    set: setQuery
  }
}

export default Search
