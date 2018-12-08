import './index.scss'
import CtaButton from '../components/Layout/CtaButton'
import Helmet from 'react-helmet'
import React from 'react'
import config from '../../data/SiteConfig'

class NotFoundPage extends React.Component {
  render() {
    return (
      <div className="index-container">
        <div className="logo-header">
          <img src={config.siteLogo} className="main-logo" alt="" />
        </div>
        <Helmet title={config.siteTitle} />
        <main>
          <h1>Oops, page not found!</h1>
          <CtaButton to="/">Back to the Home Page</CtaButton>
        </main>
      </div>
    )
  }
}

export default NotFoundPage
