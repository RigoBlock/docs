import './Header.scss'
import Navigation from './Navigation'
import React from 'react'

class Header extends React.Component {
  render() {
    return (
      <div className="site-container">
        <Navigation />
        {this.props.children}
      </div>
    )
  }
}

export default Header
