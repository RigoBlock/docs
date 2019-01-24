import './TableOfContents.scss'
import Link from 'gatsby-link'
import React, { useEffect, useRef } from 'react'
import changeCase from 'change-case'
import classNames from 'classnames'
import groupBy from 'lodash/groupBy'

const iconTypes = {
  interface: 'fas fa-vector-square',
  ['external-module']: 'fas fa-cubes',
  class: 'fas fa-cube',
  enumeration: 'fas fa-list'
}

const sortFolders = (arr = []) =>
  arr.sort((prev, curr) => {
    const a = prev[0] === 'modules' ? 1 : prev[0].length
    const b = curr[0] === 'modules' ? 1 : curr[0].length
    return a - b
  })

const sortByTocClass = arr => {
  return arr.sort((prev, curr) => {
    const prevFrontmatter = prev.entry.childMarkdownRemark.frontmatter
    const currFrontmatter = curr.entry.childMarkdownRemark.frontmatter
    if (prevFrontmatter.folder && !currFrontmatter.folder) {
      return 1
    }
    return prevFrontmatter.tocClasses.length - currFrontmatter.tocClasses.length
  })
}

const mapToLinkComponents = arr => {
  const sortedArr = sortByTocClass(arr)
  return sortedArr
    .map(el => {
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
        <li ref={ref} className="entry-list-item" key={fields.slug}>
          {!!tocClasses.length && <i className={iconClasses} />}
          <Link to={fields.slug}>{title}</Link>
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

const mapFoldersToComponents = ([folderName, documents], listTitle, index) => {
  const [refs, entries] = mapToLinkComponents(documents)
  const folderTitleComponent =
    folderName === 'docs' || !folderName ? null : (
      <div className="folder-title">{changeCase.titleCase(folderName)}</div>
    )
  const component = !folderName ? (
    <React.Fragment key={folderName || `folder-${index}`}>
      <div className="first-folder">{entries}</div>
      <div className="list-title">{listTitle}</div>
    </React.Fragment>
  ) : (
    <React.Fragment key={folderName || `folder-${index}`}>
      {folderTitleComponent}
      {entries}
    </React.Fragment>
  )
  return [refs, component]
}

const DocList = ({ data }) => {
  let refs = []
  const packages = Object.entries(
    groupBy(data.documents, 'entry.childMarkdownRemark.frontmatter.package')
  )
  const packagesAndFolders = packages.map(([packageName, values]) => {
    const folders = Object.entries(
      groupBy(values, 'entry.childMarkdownRemark.fields.folder')
    )
    const sorted = sortFolders(folders)
    return {
      package: packageName,
      folders: sorted
    }
  })

  const lists = packagesAndFolders.map(el => {
    const folders = el.folders.map(el => mapFoldersToComponents(el, data.title))
    refs = folders.map(f => f[0]).reduce((acc, curr) => [...acc, ...curr], [])
    const foldersElements = folders.map(f => f[1])
    return (
      <React.Fragment key={el.package}>
        {packages.length !== 1 && (
          <div className="package-title">
            {changeCase.titleCase(el.package)}
          </div>
        )}
        {foldersElements}
      </React.Fragment>
    )
  })

  return (
    <div>
      <ul className="package-list">{lists}</ul>
    </div>
  )
}

const TableOfContents = React.memo(
  props => {
    return (
      <div className="toc-container">
        <div className="toc-wrapper">
          {props.data && <DocList data={props.data} />}
        </div>
      </div>
    )
  },
  (prevProps, newProps) => {
    console.log('prevProps', prevProps)
    console.log('newProps', newProps)
  }
)

export default TableOfContents
