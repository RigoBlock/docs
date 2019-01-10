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
  const grouped = groupBy(
    data,
    'entry.childMarkdownRemark.frontmatter.subCategory'
  )
  const list = Object.entries(grouped).map(([name, values], index) => {
    name = name.replace(/docs|\/|packages/gi, '')
    if (!name) {
      const { title, entry } = values.pop()
      return <TitleLink key={index} title={title} entry={entry} />
    }
    let h4Content = changeCase.upperCaseFirst(name)
    let mainIndex = values
      .map(({ title }, index) => {
        if (title.toLowerCase() === name.toLowerCase()) {
          return index
        }
        return null
      })
      .filter(val => val !== null)
      .pop()
    if (Number.isInteger(mainIndex)) {
      const mainElement = values.splice(mainIndex, 1).pop()
      h4Content = (
        <Link to={mainElement.entry.childMarkdownRemark.fields.slug}>
          <div className="entry-title">
            {mainElement.entry.childMarkdownRemark.frontmatter.title}
          </div>
        </Link>
      )
    }
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
        <h4 className="folder">{h4Content}</h4>
        {entries}
      </React.Fragment>
    )
  })
  return <div>{list}</div>
}

const TableOfContents = ({ data: { title, documents } }) => (
  <div className="toc-wrapper">
    <ul className="package-list">
      <h5 className="list-title">{title}</h5>
      {documents && <DocList data={documents} />}
    </ul>
  </div>
)

export default TableOfContents
