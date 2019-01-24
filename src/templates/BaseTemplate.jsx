import './BaseTemplate.scss'
import DocumentPage from '../components/Layout/Document'
import Helmet from 'react-helmet'
import React, { useState } from 'react'
import SearchBar from '../components/Layout/SearchBar'
import SearchPage from '../components/Layout/SearchResults'
import SiteHeader from '../components/Layout/Header'

const BaseTemplate = React.memo(
  props => {
    if (typeof window !== 'undefined') {
      const { pathname } = window.location
      bodyComponent = pathname.match('/search') ? (
        <SearchPage results={results} prevUrl={prevUrl} {...props} />
      ) : (
        <DocumentPage {...props} />
      )
    }
    return (
      <div>
        <SiteHeader contents={contents}>
          <a
            className="github-link"
            href="https://github.com/RigoBlock/rigoblock-monorepo"
          >
            <i className="fab fa-github" />
          </a>
          <SearchBar
            searchIndex={props.data.siteSearchIndex}
            setResults={setResults}
            setPrevUrl={setPrevUrl}
          />
        </SiteHeader>
        {bodyComponent}
      </div>
    )
  },
  (prevProps, newProps) => {
    console.log('BaseTemplate prevProps', prevProps)
    console.log('BaseTemplate newProps', newProps)
  }
)

export default BaseTemplate

// /* eslint no-undef: "off" */
const pageQuery = graphql`
  query DocumentBySlug($slug: String!) {
    postBySlug: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
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
    allDocuments: contentJson {
      contents {
        title
        documents {
          title
          entry {
            id
            childMarkdownRemark {
              fields {
                slug
                folder
              }
              frontmatter {
                title
                tocClasses
                folder
                category
                package
              }
            }
          }
        }
      }
    }
  }
`
