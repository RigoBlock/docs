import List from './List'
import React, { Fragment } from 'react'
import TableOfContents from './TableOfContents'

const SearchResults = props => {
  const { results, data } = props
  const markdowns = data.allMarkdowns.edges
  let resultList = []
  if (results.length) {
    resultList = results.map(page => {
      const { id, title } = page
      const doc = markdowns.filter(md => id.match(md.node.id)).pop()
      return {
        title,
        to: doc.node.fields.slug,
        excerpt: doc.node.excerpt
      }
    })
  }

  return (
    <div className="body-grid">
      <div className="toc-container">
        <TableOfContents data={{ title: 'Search Results' }} />
      </div>
      <div className="search-body-container">
        {results.length !== 0 && (
          <Fragment>
            <h4>Found {results.length} page(s) matching your search:</h4>
            <List data={resultList} />
          </Fragment>
        )}
      </div>
    </div>
  )
}

export default SearchResults
