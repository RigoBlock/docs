import React from 'react'
import Helmet from 'react-helmet'
import styled from 'styled-components'
import SEO from '../components/SEO'
import config from '../../data/SiteConfig'
import CtaButton from '../components/CtaButton'
import './index.scss'

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
            <CtaButton to={'/d-app'}>Go to the documentation</CtaButton>

          </div>
        </main>
      </div>
    )
  }
}

export default Index

const BodyContainer = styled.div`
  padding: ${props => props.theme.sitePadding};
  max-width: ${props => props.theme.contentWidthLaptop};
  margin: 0 auto;

  .contributors {
    max-width: 400px;
    margin: 100px auto 0;
  }
`

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdown: allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          fields {
            slug
          }
          excerpt
          timeToRead
          frontmatter {
            title
            tags
            cover
            date
          }
        }
      }
    }
  }
`


// posts: allMarkdownRemark(
//   limit: 2000
//   filter: { frontmatter: { type: { eq: "post" } } }
//   sort: { fields: [frontmatter___date], order: DESC }
// ) {
//   edges {
//     node {
//       fields {
//         slug
//       }
//       excerpt
//       timeToRead
//       frontmatter {
//         title
//         tags
//         cover
//         date
//       }
//     }
//   }
// }
