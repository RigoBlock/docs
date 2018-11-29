import './index.scss'
import CtaButton from '../components/CtaButton'
import Helmet from 'react-helmet'
import React from 'react'
import SEO from '../components/SEO'
import config from '../../data/SiteConfig'

class Index extends React.Component {
  render() {
    const allSEOMarkdown = this.props.data.allMarkdown.edges

    return (
      <div className="index-container">
        <div className="logo-header">
          <img src={config.siteLogo} className="main-logo" alt="" />
        </div>
        <Helmet title={config.siteTitle} />
        <SEO postEdges={allSEOMarkdown} />
        <main>
          <div className="index-head-container">
            <div className="hero">
              <h1>{config.siteTitle}</h1>
            </div>
          </div>
          <div className="body-container">
            <h2>RigoBlock Packages Documentation</h2>
            <CtaButton to={'/docs/dapp'}>Go to the documentation</CtaButton>
          </div>
        </main>
      </div>
    )
  }
}

export default Index

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdown: allMarkdownRemark(limit: 2000) {
      edges {
        node {
          fields {
            slug
          }
          excerpt
          timeToRead
          frontmatter {
            title
          }
        }
      }
    }
  }
`
