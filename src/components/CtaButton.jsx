import './CtaButton.scss'
import Link from 'gatsby-link'
import React, { Component } from 'react'

class ctaButton extends Component {
  render() {
    const { children } = this.props
    return (
      <Link style={{ border: 'none' }} to={this.props.to}>
        <div className="button-container">{children}</div>
      </Link>
    )
  }
}

export default ctaButton
