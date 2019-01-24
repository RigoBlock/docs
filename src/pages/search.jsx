import './search.scss'
import List from '../components/Layout/List'
import React, { Fragment } from 'react'

const SearchPage = props => {
  const { results, data } = props
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
    <div className="search-body-container">
      {results.length !== 0 && (
        <Fragment>
          <h4>Found {results.length} page(s) matching your search:</h4>
          <List data={resultList} />
        </Fragment>
      )}
    </div>
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
