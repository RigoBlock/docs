import './Header.scss'
import Navigation from './Navigation'
import React from 'react'
import Search from './Search'

class Header extends React.Component {
  render() {
    return (
      <div className="site-container">
        <Navigation />
        <Search
          searchIndex={this.props.searchIndex}
          onSearch={this.props.onSearch}
        />
      </div>
    )
  }
}

export default Header
