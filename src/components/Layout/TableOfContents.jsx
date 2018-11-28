import React from 'react'
import Link from 'gatsby-link'
import styled from 'styled-components'
import './TableOfContents.scss'

/* eslint react/no-array-index-key: "off" */

const TitleLink = ({title, entry}) => (
  <div className="chapter-list-item" key={`${title}`}>
    <h5 className="list-entry" level={0}>
      <Link className="titleLink" to={entry.childMarkdownRemark.fields.slug}>
        {entry.childMarkdownRemark.frontmatter.title}
      </Link>
    </h5>
  </div>
)

const DocList = ({entry, key}) => (
  <div>
    <li className="entry-list-item" key={key}>
      <Link to={entry.childMarkdownRemark.fields.slug}>
        <div className="entry-title">{entry.childMarkdownRemark.frontmatter.title}</div>
      </Link>
    </li>
  </div>
)

const PackageEntry = ({title, entry, level = 1, otherDocs}) => (
  <div>
    {title && entry && (
    <TitleLink title={title} entry={entry} />
    )}
    {
      otherDocs && otherDocs.map((doc, index) => (
        <DocList {...doc} level={level + 1} key={`${index}`} />
      ))
    }
  </div>
)

const TableOfContents = ({ data: {title, packages} }) => (
  <TOCWrapper>
    <ul className="package-list">
      <h5 className="list-title">{title}</h5>
      {packages.map((pkg, index) => <PackageEntry {...pkg} key={index} />)}
    </ul>
  </TOCWrapper>
)

export default TableOfContents

const TOCWrapper = styled.div`
  padding: ${props => props.theme.sitePadding};
  margin: 0;
`
