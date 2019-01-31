import './document.scss'
import React, { Fragment } from 'react'
import TableOfContents from '../components/Layout/TableOfContents'

const Document = props => {
  const { data, toc } = props
  return (
    <Fragment>
      {toc && <TableOfContents data={toc} />}
      <div className="document-container">
        {data.postBySlug && data.postBySlug.html && (
          <div dangerouslySetInnerHTML={{ __html: data.postBySlug.html }} />
        )}
      </div>
    </Fragment>
  )
}

export default Document

export const pageQuery = graphql`
  query DocumentBySlug($slug: String!) {
    postBySlug: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
    }
  }
`
