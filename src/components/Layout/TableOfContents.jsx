import './TableOfContents.scss'
import Link from 'gatsby-link'
import React from 'react'
import changeCase from 'change-case'
import classNames from 'classnames'
import groupBy from 'lodash/groupBy'

/* eslint react/no-array-index-key: "off" */
const formatCategory = str => str.replace(/docs|\/|packages/gi, '')

const iconTypes = {
  interface: 'fas fa-vector-square',
  ['external-module']: 'fas fa-cubes',
  class: 'fas fa-cube',
  enumeration: 'fas fa-list'
}

const sortByTocClass = arr =>
  arr.sort((prev, curr) => {
    const prevClasses = prev.entry.childMarkdownRemark.frontmatter.tocClasses
    const currClasses = curr.entry.childMarkdownRemark.frontmatter.tocClasses
    return prevClasses.length - currClasses.length
  })

const mapToLinks = arr => {
  return sortByTocClass(arr).map((el, index) => {
    const { frontmatter, fields } = el.entry.childMarkdownRemark
    let { title, tocClasses } = frontmatter
    if (tocClasses.length) {
      title = title.replace(/ /g, '')
    }
    const classes = tocClasses.split(' ')
    const iconType = iconTypes[classes.shift()]
    const iconClasses = classNames(iconType, classes)
    return (
      <li className="entry-list-item" key={index}>
        {!!tocClasses.length && <i className={iconClasses} />}
        <Link to={fields.slug}>{title}</Link>
      </li>
    )
  })
}

const organizeEntries = ([category, list], index) => {
  const entries = mapToLinks(list)
  return (
    <React.Fragment key={index}>
      <div className="folder-title">{changeCase.titleCase(category)}</div>
      {entries}
    </React.Fragment>
  )
}

const DocList = ({ data }) => {
  console.log('DATA', data)
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
          <div className="category-title">
            {changeCase.titleCase(el.category)}
          </div>
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
        <div className="list-title">{data.title}</div>
        {data.documents && <DocList data={data.documents} />}
      </ul>
    </div>
  )
}

export default TableOfContents
