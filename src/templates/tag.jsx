import Helmet from 'react-helmet'
import PostListing from '../components/PostListing/PostListing'
import React from 'react'
import config from '../../data/SiteConfig'

export default class TagTemplate extends React.Component {
  render() {
    const tag = this.props.pathContext.tag
    const postEdges = this.props.data.allMarkdownRemark.edges
    return (
      <div className="tag-container">
        <Helmet title={`Posts tagged as "${tag}" | ${config.siteTitle}`} />
        <PostListing postEdges={postEdges} />
      </div>
    )
  }
}

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query TagPage($tag: String) {
    allMarkdownRemark(limit: 1000) {
      totalCount
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
