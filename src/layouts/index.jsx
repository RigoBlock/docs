import './css/index.css'
import './css/prism-okaidia.css'
import './index.scss'
import Helmet from 'react-helmet'
import React, { useState } from 'react'
import SearchBar from '../components/Layout/SearchBar'
import SiteHeader from '../components/Layout/Header'
import TableOfContents from '../components/Layout/TableOfContents'
import config from '../../data/SiteConfig'

const MainLayout = props => {
  const { children, location, match, history } = props
  const { contents } = props.data.allDocuments
  const [results, setResults] = useState([])
  const [prevUrl, setPrevUrl] = useState('')
  const toc = contents
    .filter(
      obj =>
        !!obj.documents.find(
          doc => doc.entry.childMarkdownRemark.fields.slug === location.pathname
        )
    )
    .pop()
  return (
    <div>
      <Helmet
        title="RigoBlock Documentation"
        link={[
          { rel: 'shortcut icon', type: 'image/png', href: '/favicon.ico' }
        ]}
      >
        <meta name="description" content={config.siteDescription} />
      </Helmet>
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
      <div className="body-grid">
        <TableOfContents data={toc} location={location} prevUrl={prevUrl} />
        {children({ prevUrl, results, location, match, history })}
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
