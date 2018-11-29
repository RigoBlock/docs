import About from '../components/About/About'
import Helmet from 'react-helmet'
import MainHeader from '../components/Layout/Header'
import React from 'react'
import config from '../../data/SiteConfig'
import styled from 'styled-components'

const BodyContainer = styled.div`
  padding: ${props => props.theme.sitePadding};
`

class AboutPage extends React.Component {
  render() {
    return (
      <div className="index-container">
        <Helmet title={config.siteTitle} />
        <main>
          <MainHeader
            siteTitle={config.siteTitle}
            siteDescription={config.siteDescription}
            location={this.props.location}
            logo={config.siteLogo}
          />
          <BodyContainer>
            <About />
          </BodyContainer>
        </main>
      </div>
    )
  }
}

export default AboutPage
