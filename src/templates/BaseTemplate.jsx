import './BaseTemplate.scss'
import DocumentPage from '../components/Layout/Document'
import Helmet from 'react-helmet'
import React from 'react'
import SearchBar from '../components/Layout/SearchBar'
import SearchPage from '../components/Layout/SearchResults'
import SiteHeader from '../components/Layout/Header'

export default class BaseTemplate extends React.Component {
  render() {
    const { pathname } = window.location
    let results = []
    const bodyComponent = pathname.match('/search') ? (
      <SearchPage results={results} {...this.props} />
    ) : (
      <DocumentPage {...this.props} />
    )
    return (
      <div>
        <Helmet>
          <title>RigoBlock Documentation</title>
        </Helmet>
        <div className="header-container">
          <SiteHeader>
            <SearchBar
              searchIndex={this.props.data.siteSearchIndex}
              hook={() => {}}
              location={window.location.search}
            />
          </SiteHeader>
        </div>
        {bodyComponent}
      </div>
    )
  }
}

// /* eslint no-undef: "off" */
export const pageQuery = graphql`
  query DocumentBySlug($slug: String!) {
    postBySlug: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      timeToRead
      excerpt
      frontmatter {
        title
      }
    }
    siteSearchIndex {
      index
    }
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
    allDocuments: docsJson {
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
