import './Navigation.scss'
import Link from 'gatsby-link'
import React from 'react'

class Navigation extends React.Component {
  render() {
    return (
      <div className="nav-container">
        <section>
          <Link className="nav-link" to="/">
            {' '}
            HOME{' '}
          </Link>
        </section>
      </div>
    )
  }
}

export default Navigation
