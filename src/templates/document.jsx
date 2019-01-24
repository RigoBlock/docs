import React from 'react'

export default class Document extends React.Component {
  render() {
    const postNode = this.props.data.postBySlug
    return (
      <div className="document-body-container">
        <div>
          {postNode && postNode.html && (
            <div dangerouslySetInnerHTML={{ __html: postNode.html }} />
          )}
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
