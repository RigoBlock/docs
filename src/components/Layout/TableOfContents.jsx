import './TableOfContents.scss'
import Link from 'gatsby-link'
import React from 'react'
import capitalize from 'lodash/capitalize'
import groupBy from 'lodash/groupBy'

/* eslint react/no-array-index-key: "off" */
const TitleLink = ({ title, entry }) => (
  <div className="chapter-list-item" key={`${title}`}>
    <h5 className="list-entry">
      <Link className="titleLink" to={entry.childMarkdownRemark.fields.slug}>
        {capitalize(entry.childMarkdownRemark.frontmatter.title)}
      </Link>
    </h5>
  </div>
)

const DocList = ({ data }) => {
  const grouped = groupBy(data, 'entry.childMarkdownRemark.fields.folder')
  console.log(grouped)
  const list = Object.entries(grouped).map(([key, values], index) => {
    const entries = values.map((el, index) => (
      <li className="entry-list-item" key={index}>
        {console.log('ENTRY', el)}
        <Link to={el.entry.childMarkdownRemark.fields.slug}>
          <div className="entry-title">
            {el.entry.childMarkdownRemark.frontmatter.title}
          </div>
        </Link>
      </li>
    ))
    return (
      <React.Fragment key={index}>
        <h3>{key}</h3>
        {entries}
      </React.Fragment>
    )
  })
  return (
    <div>
      {list}
      {/* <li className="entry-list-item">
      <Link to={entry.childMarkdownRemark.fields.slug}>
        <div className="entry-title">
          {entry.childMarkdownRemark.frontmatter.title}
        </div>
      </Link>
    </li> */}
    </div>
  )
}

const PackageEntry = ({ title, entry, level = 1, children }) => (
  <div>
    {title && entry && <TitleLink title={title} entry={entry} />}
    {children && <DocList data={children} />}
  </div>
)
// children.map((doc, index) => (
//   <DocList {...doc} level={level + 1} key={`${index}`} />
// ))

const TableOfContents = ({ data: { title, documents } }) => (
  <div className="toc-wrapper">
    <ul className="package-list">
      <h5 className="list-title">{title}</h5>
      {documents &&
        documents.map((pkg, index) => <PackageEntry {...pkg} key={index} />)}
    </ul>
  </div>
)

export default TableOfContents
