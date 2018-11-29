import Helmet from 'react-helmet'
import PostListing from '../components/PostListing/PostListing'
import React from 'react'
import config from '../../data/SiteConfig'

export default class CategoryTemplate extends React.Component {
  render() {
    const category = this.props.pathContext.category
    const postEdges = this.props.data.allMarkdownRemark.edges
    return (
      <div className="category-container">
        <Helmet
          title={`Posts in category "${category}" | ${config.siteTitle}`}
        />
        <PostListing postEdges={postEdges} />
      </div>
    )
  }
}

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query CategoryPage($category: String) {
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
