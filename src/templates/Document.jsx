import './Document.scss'
import Helmet from 'react-helmet'
import React from 'react'
import SEO from '../components/SEO'
import SiteHeader from '../components/Layout/Header'
import TableOfContents from '../components/Layout/TableOfContents'
import config from '../../data/SiteConfig'

export default class DocumentTemplate extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      results: []
    }
  }

  onSearch = index => evt => {
    const markdowns = this.props.data.markdownList.edges
    const query = evt.target.value
    const newState = {
      query,
      results: []
    }
    if (query.length >= 3) {
      const queryResults = index
        .search(query, {
          title: { boost: 2 },
          content: { boost: 1 }
        }) // Map over each ID and return the full document
        .map(({ ref }) => index.documentStore.getDoc(ref))
      if (queryResults.length) {
        newState.results = queryResults.map(page => {
          const { id, title } = page
          const doc = markdowns.filter(md => id.match(md.node.id)).pop()
          return {
            title,
            to: doc.node.fields.slug
          }
        })
      }
    }
    this.setState(newState)
  }

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
            <SiteHeader
              location={this.props.location}
              searchIndex={this.props.data.siteSearchIndex}
              onSearch={this.onSearch}
            />
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
    markdownList: allMarkdownRemark {
      edges {
        node {
          id
          fields {
            slug
          }
        }
      }
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
