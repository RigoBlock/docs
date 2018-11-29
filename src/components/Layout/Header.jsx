import Navigation from './Navigation'
import React from 'react'
import styled from 'styled-components'

class MainHeader extends React.Component {
  render() {
    return (
      <SiteContainer>
        <Navigation />
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

export default MainHeader
