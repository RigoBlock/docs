import './TableOfContents.scss'
import Link from 'gatsby-link'
import React from 'react'
import capitalize from 'lodash/capitalize'
import changeCase from 'change-case'
import groupBy from 'lodash/groupBy'

/* eslint react/no-array-index-key: "off" */
const TitleLink = ({ title, entry }) => (
  <div className="chapter-list-item" key={`${title}`}>
    <h5 className="list-entry">
      <Link className="title-link" to={entry.childMarkdownRemark.fields.slug}>
        {capitalize(entry.childMarkdownRemark.frontmatter.title)}
      </Link>
    </h5>
  </div>
)

const DocList = ({ data }) => {
  const grouped = groupBy(data, 'entry.childMarkdownRemark.fields.folder')
  const list = Object.entries(grouped).map(([name, values], index) => {
    const entries = values.map((el, index) => (
      <li className="entry-list-item" key={index}>
        <Link to={el.entry.childMarkdownRemark.fields.slug}>
          <div className="entry-title">
            {el.entry.childMarkdownRemark.frontmatter.title}
          </div>
        </Link>
      </li>
    ))
    return (
      <React.Fragment key={index}>
        <h4 className="folder">{changeCase.upperCaseFirst(name)}</h4>
        {entries}
      </React.Fragment>
    )
  })
  return <div>{list}</div>
}

const PackageEntry = ({ title, entry, children }) => (
  <div>
    {title && entry && <TitleLink title={title} entry={entry} />}
    {children && <DocList data={children} />}
  </div>
)

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
