import './index.scss'
import CtaButton from '../components/Layout/CtaButton'
import Helmet from 'react-helmet'
import React from 'react'
import SearchBar from '../components/Layout/SearchBar'
import config from '../../data/SiteConfig'

class Index extends React.Component {
  render() {
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
              <SearchBar searchIndex={this.props.data.siteSearchIndex} />
            </div>
          </div>
          <div className="body-container">
            <CtaButton to={'/dapp'}>Go to the documentation</CtaButton>
            <CtaButton to={'/reference'}>Go to KB articles</CtaButton>
          </div>
        </main>
      </div>
    )
  }
}

export default Index

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    siteSearchIndex {
      index
    }
  }
`
