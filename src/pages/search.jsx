import '../templates/Document.scss'
import './search.scss'
import { navigateTo } from 'gatsby-link'
import Helmet from 'react-helmet'
import React, { useState } from 'react'
import Search from '../components/Layout/Search'
import SearchResults from '../components/Layout/SearchResults'
import SiteHeader from '../components/Layout/Header'
import config from '../../data/SiteConfig'
// import TableOfContents from '../components/Layout/TableOfContents'

const SearchTemplate = props => {
  const results = useResults()
  const markdowns = props.data.markdownList
  let displayedResults = []

  if (results.value.length !== 0) {
    console.log('VAL', results.value)
    const mapped = results.value.map(page => {
      const { id, title } = page
      const doc = markdowns.filter(md => {
        console.log('HERE')
        console.log(md)
        // id.match(md.node.id)
      })
      // .pop()
      console.log(doc)
    })
    // displayedResults = results.value.map(page => {
    //   console.log(page)
    //   const { id, title } = page
    //   const doc = markdowns.filter(md => id.match(md.node.id)).pop()
    //   return {
    //     title,
    //     to: doc.node.fields.slug
    //   }
    // })

    // console.log(displayedResults)
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
              hook={results.update}
              location={props.location}
            />
          </SiteHeader>
        </div>
        <div className="toc-container">
          {/* <TableOfContents data={packages} /> */}
        </div>
        <div className="search-body">
          <h1>Search results</h1>
          {/* {displayedResults.length !== 0 && (
            <SearchResults data={state.results} />
          )} */}
        </div>
      </div>
    </div>
  )
}

const useResults = () => {
  const [results, setResults] = useState([])
  return {
    value: results,
    update: setResults
  }
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
