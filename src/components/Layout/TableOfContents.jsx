import './TableOfContents.scss'
import Link from 'gatsby-link'
import React from 'react'
import changeCase from 'change-case'
import groupBy from 'lodash/groupBy'

/* eslint react/no-array-index-key: "off" */
const formatCategory = str => str.replace(/docs|\/|packages/gi, '')

const mapToLinks = arr =>
  arr.map((el, index) => (
    <li className="entry-list-item" key={index}>
      <Link to={el.entry.childMarkdownRemark.fields.slug}>
        <div className="entry-title">
          {el.entry.childMarkdownRemark.frontmatter.title}
        </div>
      </Link>
    </li>
  ))

const organizeEntries = ([category, list], index) => {
  const entries = mapToLinks(list)
  return (
    <React.Fragment key={index}>
      <h3>{changeCase.titleCase(category)}</h3>
      {entries}
    </React.Fragment>
  )
}

const DocList = ({ data }) => {
  const categories = Object.entries(
    groupBy(data, 'entry.childMarkdownRemark.frontmatter.subCategory')
  )
  const categoriesAndFolders = categories.map(([subCategory, values]) => {
    subCategory = formatCategory(subCategory)
    let groupByFolder = groupBy(
      values,
      'entry.childMarkdownRemark.fields.folder'
    )
    let entries = []
    if (groupByFolder[subCategory]) {
      entries = groupByFolder[subCategory]
      delete groupByFolder[subCategory]
    }
    return {
      category: subCategory,
      entries,
      folders: Object.keys(groupByFolder).length ? groupByFolder : []
    }
  })
  const lists = categoriesAndFolders.map((el, index) => {
    const entries = mapToLinks(el.entries)
    const folders = Object.entries(el.folders).map(organizeEntries)
    return (
      <React.Fragment key={index}>
        {categories.length !== 1 && (
          <h4>{changeCase.titleCase(el.category)}</h4>
        )}
        {entries}
        {folders}
      </React.Fragment>
    )
  })
  return <div>{lists}</div>
}

const TableOfContents = ({ data }) => {
  if (!data) {
    return null
  }
  return (
    <div className="toc-wrapper">
      <ul className="package-list">
        <h3 className="list-title">{data.title}</h3>
        {data.documents && <DocList data={data.documents} />}
      </ul>
    </div>
  )
}

export default TableOfContents
