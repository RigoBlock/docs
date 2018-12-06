import './TableOfContents.scss'
import Link from 'gatsby-link'
import React from 'react'
import capitalize from 'lodash/capitalize'

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

const DocList = ({ entry }) => (
  <div>
    <li className="entry-list-item">
      <Link to={entry.childMarkdownRemark.fields.slug}>
        <div className="entry-title">
          {entry.childMarkdownRemark.frontmatter.title}
        </div>
      </Link>
    </li>
  </div>
)

const PackageEntry = ({ title, entry, level = 1, otherDocs }) => (
  <div>
    {title && entry && <TitleLink title={title} entry={entry} />}
    {otherDocs &&
      otherDocs.map((doc, index) => (
        <DocList {...doc} level={level + 1} key={`${index}`} />
      ))}
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
