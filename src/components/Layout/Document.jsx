import React from 'react'
import TableOfContents from './TableOfContents'

export default class Document extends React.Component {
  render() {
    const { contents } = this.props.data.allDocuments
    const { category } = this.props.pathContext
    const toc = contents.filter(obj => obj.title === category).pop()
    const postNode = this.props.data.postBySlug
    return (
      <div className="body-grid">
        <div className="toc-container">
          {toc && <TableOfContents data={toc} />}
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
