import '../templates/Document.scss'
import './search.scss'
import { navigateTo } from 'gatsby-link'
import Helmet from 'react-helmet'
import React from 'react'
import SearchResults from '../components/Layout/SearchResults'
import SiteHeader from '../components/Layout/Header'
// import TableOfContents from '../components/Layout/TableOfContents'
import config from '../../data/SiteConfig'

export default class SearchTemplate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      results: []
    }
  }

  onSearch = index => evt => {
    const { pathname } = this.props.location
    if (pathname !== '/search') {
      navigateTo('/search?q=')
    }
    const markdowns = this.props.data.markdownList.edges
    const query = evt.target.value
    const newState = {
      query,
      results: []
    }

    if (query.length >= 3) {
      const queryResults = index
        .search(query, {
          title: { boost: 2 },
          content: { boost: 1 }
        }) // Map over each ID and return the full document
        .map(({ ref }) => index.documentStore.getDoc(ref))
      if (queryResults.length) {
        newState.results = queryResults.map(page => {
          const { id, title } = page
          const doc = markdowns.filter(md => id.match(md.node.id)).pop()
          console.log('DOC', doc)
          return {
            title,
            to: doc.node.fields.slug,
            excerpt: doc.node.excerpt
          }
        })
      }
    }
    this.setState(newState)
  }

  render() {
    // const [packages, kb] = this.props.data.allData.contents
    // const { category } = this.props.pathContext
    return (
      <div>
        <Helmet>
          <title>{`${config.siteTitle}`}</title>
        </Helmet>
        <div className="body-grid">
          <div className="header-container">
            <SiteHeader
              location={this.props.location}
              searchIndex={this.props.data.siteSearchIndex}
              onSearch={this.onSearch}
            />
          </div>
          <div className="toc-container">
            {/* <TableOfContents data={packages} /> */}
          </div>
          <div className="search-body">
            <h1>Search results</h1>
            {this.state.results.length !== 0 && (
              <SearchResults data={this.state.results} />
            )}
          </div>
        </div>
      </div>
    )
  }
}

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
