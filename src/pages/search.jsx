import './search.scss'
import Link from 'gatsby-link'
import List from '../components/Layout/List'
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
  const searchComponent = results.length ? (
    <React.Fragment>
      <div className="search-title">
        Found {results.length} page(s) matching your search:
      </div>
      <List data={resultList} />
    </React.Fragment>
  ) : (
    <div className="search-title no-results">
      Search did not match any content.
      <ul className="search-suggestions">
        <li>Make sure all words are spelled correctly</li>
        <li>Try with different keywords</li>
        <li>Try using more general keywords</li>
        <li>Try fewer keywords</li>
      </ul>
    </div>
  )

  return (
    <Fragment>
      <div className="toc-search-container">
        <div className="toc-search-wrapper">
          <h3>Search Results</h3>
          <div className="go-back-link">
            <Link to={prevUrl || '/'}>
              <i className="fas fa-undo-alt" />
              Go back
            </Link>
          </div>
        </div>
      </div>
      <div className="search-page-container">{searchComponent}</div>
    </Fragment>
  )
}

export default SearchPage

export const pageQuery = graphql`
  query SearchPageQuery {
    allMarkdowns: allMarkdownRemark {
      edges {
        node {
          id
          excerpt
          fields {
            slug
          }
        }
      }
    }
  }
`
