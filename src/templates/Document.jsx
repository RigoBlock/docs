import React from 'react'
import TableOfContents from '../components/Layout/TableOfContents'
import config from '../../data/SiteConfig'

export default class Document extends React.Component {
  render() {
    const [packages, kb] = this.props.data.allDocuments.contents
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
      <div className="body-grid">
        <div className="toc-container">
          <TableOfContents data={category === 'packages' ? packages : kb} />
        </div>
        <div className="document-body-container">
          <div>
            <div dangerouslySetInnerHTML={{ __html: postNode.html }} />
          </div>
        </div>
      </div>
    )
  }
}
