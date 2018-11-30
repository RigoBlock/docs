import Navigation from './Navigation'
import React from 'react'
import Search from './Search'
import styled from 'styled-components'

class Header extends React.Component {
  render() {
    return (
      <SiteContainer>
        <Navigation />
        <Search searchIndex={this.props.searchIndex} />
      </SiteContainer>
    )
  }
}

const SiteContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0a4186;
  padding: 25px;
`

export default Header
