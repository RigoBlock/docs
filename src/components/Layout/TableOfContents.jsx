import './TableOfContents.scss'
import Link from 'gatsby-link'
import React, { useEffect, useRef, useState } from 'react'
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
  return sortByTocClass(arr)
    .map((el, index) => {
      const { frontmatter, fields } = el.entry.childMarkdownRemark
      let { title, tocClasses } = frontmatter
      if (tocClasses.length) {
        title = title.replace(/ /g, '')
      }
      const classes = tocClasses.split(' ')
      const iconType = iconTypes[classes.shift()]
      const iconClasses = classNames(iconType, classes)
      const ref = useRef(fields.slug)
      return [
        ref,
        <li className="entry-list-item" key={index} ref={ref}>
          {!!tocClasses.length && <i className={iconClasses} />}
          <Link to={fields.slug}>
            <div className="entry-title">{title}</div>
          </Link>
        </li>
      ]
    })
    .reduce(
      (acc, [ref, el]) => {
        acc[0].push(ref)
        acc[1].push(el)
        return acc
      },
      [[], []]
    )
}

const organizeEntries = ([category, list]) => {
  const [refs, entries] = mapToLinks(list)
  return [
    refs,
    <React.Fragment key={category}>
      <h3>{changeCase.titleCase(category)}</h3>
      {entries}
    </React.Fragment>
  ]
}

const DocList = ({ data }) => {
  const categories = Object.entries(
    groupBy(data, 'entry.childMarkdownRemark.frontmatter.subCategory')
  )
  const ref = React.useRef()
  const scrollTo = useSmoothScroll('x', ref)

  let refs = []

  useEffect(r => {
    console.log('loaded', r)
    console.log('el', refs)
  }, [])

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
    refs = folders.map(f => f[0]).reduce((acc, curr) => [...acc, ...curr], [])
    const foldersElements = folders.map(f => f[1])
    return (
      <React.Fragment key={index}>
        {categories.length !== 1 && (
          <h4>{changeCase.titleCase(el.category)}</h4>
        )}
        {entries}
        {foldersElements}
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
