import './SearchResults.scss'
import Link from 'gatsby-link'
import List from './List'
import React, { Fragment } from 'react'

const SearchPage = props => {
  const { results, data, prevUrl } = props
  const markdowns = data.allMarkdowns.edges
  let resultList = []
  if (results.length) {
    resultList = results
      .map(page => {
        const { id, title } = page
        const doc = markdowns.find(md => id.match(md.node.id))
        if (doc) {
          return {
            title,
            to: doc.node.fields.slug,
            excerpt: doc.node.excerpt
          }
        }
        return null
      })
      .filter(val => !!val)
  }

  return (
    <div className="body-grid">
      <div className="toc-container">
        <div className="toc-search-wrapper">
          <h3>Search Results</h3>
          {prevUrl && (
            <h4>
              <Link to={prevUrl}>Back</Link>
            </h4>
          )}
        </div>
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

export default SearchPage
