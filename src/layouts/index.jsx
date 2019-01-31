import './css/index.css'
import './css/prism-okaidia.css'
import './index.scss'
import Helmet from 'react-helmet'
import React, { useEffect, useState } from 'react'
import SearchBar from '../components/Layout/SearchBar'
import SiteHeader from '../components/Layout/Header'
import config from '../../data/SiteConfig'
import qs from 'qs'

const MainLayout = props => {
  const { children, location, match, history } = props
  const { contents } = props.data.allDocuments
  const [results, setResults] = useState([])
  const [prevUrl, setPrevUrl] = useState('')
  const { from } = qs.parse(location.search, {
    ignoreQueryPrefix: true
  })
  const toc = contents
    .filter(
      obj =>
        !!obj.documents.find(
          doc =>
            location.pathname.replace(/\/$/, '') ===
            doc.entry.childMarkdownRemark.fields.slug
        )
    )
    .pop()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.navigator.serviceWorker) {
      window.navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let reg of registrations) {
          reg.unregister()
        }
      })
    }
  }, [])

  useEffect(
    () => {
      if (location.pathname.replace(/\/$/, '') === '/search') {
        if (from) {
          setPrevUrl(from)
        }
      }
    },
    [location.pathname]
  )

  return (
    <div>
      <Helmet
        title="RigoBlock Documentation"
        link={[
          { rel: 'shortcut icon', type: 'image/png', href: '/favicon.ico' }
        ]}
        meta={[
          {
            name: 'description',
            content: config.siteDescription
          }
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
          location={location}
          prevUrl={prevUrl}
          setResults={setResults}
        />
      </SiteHeader>
      <div className="body-container">
        {children({ prevUrl, results, location, match, history, toc })}
      </div>
    </div>
  )
}

export default MainLayout

export const pageQuery = graphql`
  query mainLayoutQuery {
    siteSearchIndex {
      index
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
