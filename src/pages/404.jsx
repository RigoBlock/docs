import './404.scss'
import './index.scss'
import CtaButton from '../components/Layout/CtaButton'
import React from 'react'
import config from '../../data/SiteConfig'

class NotFoundPage extends React.Component {
  render() {
    return (
      <div className="not-found-container">
        <div className="logo-header">
          <img src={config.siteLogo} className="main-logo" alt="" />
        </div>
        <h1>Oops, page not found!</h1>
        <CtaButton to="/">Go back</CtaButton>
      </div>
    )
  }
}

export default NotFoundPage
