import './TableOfContents.scss'
import Link from 'gatsby-link'
import React from 'react'
import changeCase from 'change-case'
import groupBy from 'lodash/groupBy'

/* eslint react/no-array-index-key: "off" */
const formatCategory = str => str.replace(/docs|\/|packages/gi, '')
const formatEntry = str => {
  let result = str.replace(/contracts(?=\s)|models(?=\s)/gi, '').trim()
  if (result.indexOf('events') !== -1) {
    result = result.split('events').join(' ')
  }
  return result
}

const organizeEntries = ([category, list], index) => {
  const entries = list.map((el, index) => {
    let { title } = el.entry.childMarkdownRemark.frontmatter
    title = formatEntry(title)
    return (
      <li className="entry-list-item" key={index}>
        <Link to={el.entry.childMarkdownRemark.fields.slug}>
          <div className="entry-title">{title}</div>
        </Link>
      </li>
    )
  })
  return (
    <React.Fragment key={index}>
      <h5>{changeCase.titleCase(category)}</h5>
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
  let lists
  if (categoriesAndFolders.length === 1) {
    const el = categoriesAndFolders.pop()
    const folders = Object.entries(el.folders).map(organizeEntries)
    const entries = el.entries.map((el, index) => {
      return (
        <li className="entry-list-item" key={index}>
          <Link to={el.entry.childMarkdownRemark.fields.slug}>
            <div className="entry-title">
              {el.entry.childMarkdownRemark.frontmatter.title}
            </div>
          </Link>
        </li>
      )
    })
    lists = (
      <React.Fragment>
        {entries}
        {folders}
      </React.Fragment>
    )
  } else {
    lists = categoriesAndFolders.map((el, index) => {
      const entries = el.entries.map((el, index) => {
        return (
          <li className="entry-list-item" key={index}>
            <Link to={el.entry.childMarkdownRemark.fields.slug}>
              <div className="entry-title">
                {el.entry.childMarkdownRemark.frontmatter.title}
              </div>
            </Link>
          </li>
        )
      })
      const folders = Object.entries(el.folders).map(organizeEntries)
      return (
        <React.Fragment key={index}>
          <h4>{changeCase.titleCase(el.category)}</h4>
          {entries}
          {folders}
        </React.Fragment>
      )
    })
  }
  return <div>{lists}</div>
}

const TableOfContents = ({ data }) => {
  if (!data) {
    return null
  }
  return (
    <div className="toc-wrapper">
      <ul className="package-list">
        <h5 className="list-title">{data.title}</h5>
        {console.log(data.documents)}
        {data.documents && <DocList data={data.documents} />}
      </ul>
    </div>
  )
}

export default TableOfContents
