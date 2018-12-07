import './Navigation.scss'
import Link from 'gatsby-link'
import React from 'react'

class Navigation extends React.Component {
  render() {
    return (
      <div className="nav-container">
        {/* <section> */}
        <Link className="nav-link" to="/">
          HOME
        </Link>
        <Link className="nav-link" to="/dapp">
          DOCS
        </Link>
        <Link className="nav-link" to="/linux-06-dokku">
          KB
        </Link>
        {/* </section> */}
      </div>
    )
  }
}

export default Navigation
