import './BaseTemplate.scss'
import DocumentPage from '../components/Layout/Document'
import Helmet from 'react-helmet'
import React, { useState } from 'react'
import SearchBar from '../components/Layout/SearchBar'
import SearchPage from '../components/Layout/SearchResults'
import SiteHeader from '../components/Layout/Header'

const BaseTemplate = props => {
  const [results, setResults] = useState([])
  const [prevUrl, setPrevUrl] = useState('')
  const { contents } = props.data.allDocuments
  let bodyComponent = <DocumentPage {...props} />
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
      <Helmet
        title="RigoBlock Documentation"
        link={[
          { rel: 'shortcut icon', type: 'image/png', href: '/favicon.ico' }
        ]}
      />
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
}

export default BaseTemplate

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
