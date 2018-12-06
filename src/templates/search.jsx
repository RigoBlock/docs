import '../templates/Document.scss'
import './search.scss'
import Helmet from 'react-helmet'
import React, { useState } from 'react'
import Search from '../components/Layout/Search'
import SearchResults from '../components/Layout/SearchResults'
import SiteHeader from '../components/Layout/Header'
import config from '../../data/SiteConfig'
// import TableOfContents from '../components/Layout/TableOfContents'

const SearchTemplate = props => {
  const [results, setResults] = useState([])
  const markdowns = props.data.markdownList.edges
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
    <div>
      <Helmet>
        <title>{`${config.siteTitle}`}</title>
      </Helmet>
      <div className="body-grid">
        <div className="header-container">
          <SiteHeader>
            <Search
              searchIndex={props.data.siteSearchIndex}
              hook={setResults}
              location={window.location.search}
            />
          </SiteHeader>
        </div>
        <div className="toc-container">
          {/* <TableOfContents data={packages} /> */}
        </div>
        <div className="search-body">
          <h1>Search results</h1>
          {results.length !== 0 && <SearchResults data={resultList} />}
        </div>
      </div>
    </div>
  )
}

export default SearchTemplate
// /* eslint no-undef: "off" */
export const pageQuery = graphql`
  query SearchQuery {
    siteSearchIndex {
      index
    }
    markdownList: allMarkdownRemark {
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
    allData: docsJson {
      contents {
        title
        documents {
          title
          entry {
            id
            childMarkdownRemark {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
          otherDocs {
            title
            entry {
              id
              childMarkdownRemark {
                fields {
                  slug
                }
                frontmatter {
                  title
                }
              }
            }
          }
        }
      }
    }
  }
`
