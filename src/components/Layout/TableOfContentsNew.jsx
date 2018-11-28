import React from 'react'
import Link from 'gatsby-link'
import styled from 'styled-components'
import './TableOfContents.scss'

/* eslint react/no-array-index-key: "off" */

const Links = ({ entries }) => (
  <StyledLinkList>
    {entries.map(({ entry }, key) => (
      <EntryListItem key={key}>
        <Link to={entry.childMarkdownRemark.fields.slug}>
          <EntryTitle>{entry.childMarkdownRemark.frontmatter.title}</EntryTitle>
        </Link>
      </EntryListItem>
    ))}
  </StyledLinkList>
)

const TitleLink = ({title, entry}) => (
  <ChapterListItem key={`${title}`}>
    <ChapterTitle level={0}>
      <Link className="titleLink" to={entry.childMarkdownRemark.fields.slug}>
        {entry.childMarkdownRemark.frontmatter.title}
      </Link>
    </ChapterTitle>
  </ChapterListItem>
)

const DocList = ({title, entry, key, level}) => (
  <StyledChapterList>
    {console.log('INSIDE DOCLIST', title, entry)}
    <EntryListItem key={key}>
      <Link to={entry.childMarkdownRemark.fields.slug}>
        <EntryTitle>{entry.childMarkdownRemark.frontmatter.title}</EntryTitle>
      </Link>
    </EntryListItem>
  </StyledChapterList>
)

const PackageEntry = ({title, entry, level = 1, otherDocs = null}) => (
  <StyledChapterList>
    {otherDocs && console.log('OTHERDOCS', otherDocs)}
    {title && entry && (
    <TitleLink title={title} entry={entry} />
    )}
    {
      otherDocs && otherDocs.map((doc, index) => (
        <DocList {...doc} level={level + 1} key={`${index}`} />
      ))
    }
  </StyledChapterList>
)

const ChapterList = ({ chapters, entries, title, level = 0 }) => (
  <StyledChapterList>
    {title && (
      <ChapterListItem key={`${title}${level}`}>
        <ChapterTitle level={level}>{title}</ChapterTitle>
      </ChapterListItem>
    )}
    <ChapterListItem>{entries && <Links entries={entries} />}</ChapterListItem>
    <ChapterListItem>
      {chapters &&
        chapters.map((chapter, index) => (
          <ChapterList {...chapter} level={level + 1} key={`${index}`} />
        ))}
    </ChapterListItem>
  </StyledChapterList>
)

const TableOfContents = ({ data: {title, packages} }) => (
  <TOCWrapper>
    <StyledChapterList>
      <ChapterTitle level={0}>{title}</ChapterTitle>
      {packages.map((pkg, index) => <PackageEntry {...pkg} key={index} />)}
    </StyledChapterList>
  </TOCWrapper>
)

export default TableOfContents

const TOCWrapper = styled.div`
  padding: ${props => props.theme.sitePadding};
  margin: 0;
`

const StyledChapterList = styled.ol`
  list-style: none;
  margin: 0;
`

const StyledLinkList = styled.ol`
  list-style: none;
`

const EntryTitle = styled.h6`
  display: inline-block;
  font-weight: 200;
  color: black;
  margin: 0;
  line-height: 1.5;
  border-bottom: 1px solid transparent;
  text-decoration: none;
`

const ChapterListItem = styled.li`
  margin: 0;
`

const EntryListItem = styled.li`
  margin: 0;
  a:hover {
    border-bottom: 1px solid black;
  }
`

const ChapterTitle = styled.h5`
  font-weight: ${({ level }) => {
    switch (level % 3) {
      case 1:
        return '600'
      case 2:
        return '400'
      default:
        return '200'
    }
  }};
  font-size: ${({ level }) => {
    switch (level % 3) {
      case 1:
        return '2.2rem'
      case 2:
        return '1.8rem'
      default:
        return '2.8rem'
    }
  }};
  color: ${({ level, theme }) => {
    switch (level % 3) {
      case 1:
        return 'black'
      case 2:
        return theme.accent
      default:
        return theme.brand
    }
  }};
`
