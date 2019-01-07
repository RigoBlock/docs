import './Header.scss'
import Navigation from './Navigation'
import React from 'react'

const Header = ({ children, contents }) => (
  <div className="site-container">
    <Navigation contents={contents} />
    {children}
  </div>
)

export default Header
