import './index.scss'
import CtaButton from '../components/Layout/CtaButton'
import Helmet from 'react-helmet'
import React from 'react'
import SearchWithButton from '../components/Layout/SearchWithButton'
import config from '../../data/SiteConfig'

const Index = props => {
  const { contents } = props.data.allDocuments
  const ctaButtons = contents.map((obj, index) => {
    const { title } = obj
    const to = obj.documents[0].title
    return (
      <CtaButton key={index} to={`/${to}`}>
        {title} documentation.
      </CtaButton>
    )
  })
  return (
    <div className="index-container">
      <div className="logo-header">
        <img src={config.siteLogo} className="main-logo" alt="" />
      </div>
      <Helmet title={config.siteTitle} />
      <main>
        <div className="index-head-container">
          <div className="hero">
            <h1>{config.siteTitle}</h1>
            <SearchWithButton searchIndex={props.data.siteSearchIndex} />
          </div>
        </div>
        <div className="body-container">{ctaButtons}</div>
      </main>
    </div>
  )
}

export default Index

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    siteSearchIndex {
      index
    }
    allDocuments: contentJson {
      contents {
        title
        documents {
          title
        }
      }
    }
  }
`
