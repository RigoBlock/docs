import React from 'react'
import Link from 'gatsby-link'
import './Navigation.scss'

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
