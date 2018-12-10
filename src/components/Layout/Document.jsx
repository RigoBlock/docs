import React from 'react'
import TableOfContents from './TableOfContents'

export default class Document extends React.Component {
  render() {
    const [packages, kb] = this.props.data.allDocuments.contents
    const { category } = this.props.pathContext
    const postNode = this.props.data.postBySlug
    return (
      <div className="body-grid">
        <div className="toc-container">
          <TableOfContents
            data={category === 'rigoblock-monorepo' ? packages : kb}
          />
        </div>
        <div className="document-body-container">
          <div>
            {postNode && postNode.html && (
              <div dangerouslySetInnerHTML={{ __html: postNode.html }} />
            )}
          </div>
        </div>
      </div>
    )
  }
}
