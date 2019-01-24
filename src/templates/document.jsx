import React from 'react'
import TableOfContents from '../components/Layout/TableOfContents'

export default class Document extends React.Component {
  render() {
    const { contents } = this.props
    const { category } = this.props.pathContext
    const toc = contents.find(obj => obj.title === category)
    const postNode = this.props.data.postBySlug
    return (
      <div className="body-grid">
        <TableOfContents data={toc} />
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

export const pageQuery = graphql`
  query DocumentBySlug($slug: String!) {
    postBySlug: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
  }
`
