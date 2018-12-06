import './Document.scss'
import Helmet from 'react-helmet'
import React from 'react'
import SEO from '../components/SEO'
import Search from '../components/Layout/Search'
import SiteHeader from '../components/Layout/Header'
import TableOfContents from '../components/Layout/TableOfContents'
import config from '../../data/SiteConfig'

export default class DocumentTemplate extends React.Component {
  render() {
    const [packages, kb] = this.props.data.allData.contents
    const { slug, category } = this.props.pathContext
    const postNode = this.props.data.postBySlug
    const post = postNode.frontmatter
    if (!post.id) {
      post.id = slug
    }
    if (!post.id) {
      post.category_id = config.postDefaultCategoryID
    }
    return (
      <div>
        <Helmet>
          <title>{`${post.title} | ${config.siteTitle}`}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <div className="body-grid">
          <div className="header-container">
            <SiteHeader>
              <Search
                searchIndex={this.props.data.siteSearchIndex}
                hook={() => {}}
                location={window.location.search}
              />
            </SiteHeader>
          </div>
          <div className="toc-container">
            <TableOfContents data={category === 'packages' ? packages : kb} />
          </div>
          <div className="document-body-container">
            <div>
              <div dangerouslySetInnerHTML={{ __html: postNode.html }} />
            </div>
          </div>
        </div>
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
