import './Header.scss'
import Navigation from './Navigation'
import React from 'react'
import config from '../../../data/SiteConfig'

const Header = ({ children, contents }) => (
  <div className="site-container">
    <div className="side-logo">
      <a href="https://beta.rigoblock.com">
        <img src={config.siteLogoSmall} className="small-logo" alt="" />
      </a>
    </div>
    <Navigation contents={contents} />
    {children}
  </div>
)

export default Header
