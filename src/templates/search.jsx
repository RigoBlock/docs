import React from 'react'
import SearchResults from '../components/Layout/SearchResults'
import TableOfContents from '../components/Layout/TableOfContents'

const SearchTemplate = props => {
  const { results, data } = props
  const markdowns = data.allMarkdowns.edges
  let resultList = []
  if (results.length) {
    resultList = results.map(page => {
      const { id, title } = page
      const doc = markdowns.filter(md => id.match(md.node.id)).pop()
      return {
        title,
        to: doc.node.fields.slug,
        excerpt: doc.node.excerpt
      }
    })
  }

  return (
    <div className="body-grid">
      <div className="toc-container">
        <TableOfContents data={{ title: 'Search Results' }} />
      </div>
      <div className="document-body-container">
        {results.length !== 0 && <SearchResults data={resultList} />}
      </div>
    </div>
  )
}

export default SearchTemplate
