import './Search.scss'
import { Index } from 'elasticlunr'
import { navigateTo } from 'gatsby-link'
import React, { useEffect, useState } from 'react'

let index

const Search = props => {
  const index = getOrCreateIndex(props)
  const query = useQuery(props.hook, index)

  // useEffect(() => {
  //   window.location.search = query.value
  // })

  return (
    <input
      type="text"
      className="search"
      placeholder="Search"
      value={query.value}
      onChange={query.onChange}
    />
  )
}

const getOrCreateIndex = props => {
  if (!index) {
    // Create an elastic lunr index and hydrate with graphql query results
    index = Index.load(props.searchIndex.index)
  }
  return index
}

const useQuery = (updateFunc, index) => {
  const [query, setQuery] = useState('')

  const handleChange = e => {
    const query = e.target.value
    setQuery(query)
    if (query.length >= 3) {
      const results = index
        .search(query, {
          title: { boost: 2 },
          content: { boost: 1 }
        })
        .map(({ ref }) => index.documentStore.getDoc(ref))
      updateFunc(results)
      navigateTo('/search?q=' + query)
    }
  }

  return {
    value: query,
    onChange: handleChange
  }
}

export default Search

// onSearch = evt => {
//   const query = evt.target.value
//   console.log('QUERY', query)
//   const newState = {
//     query
//   }
//   navigateTo('/search?q=' + query)

//   if (query.length >= 3) {
//     this.index = this.getOrCreateIndex()
//     newState.results = this.index
//       .search(query, {
//         title: { boost: 2 },
//         content: { boost: 1 }
//       })
//       // Map over each ID and return the full document
//       .map(({ ref }) => this.index.documentStore.getDoc(ref))
//   }

//   this.setState(newState)
// }
