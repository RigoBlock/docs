import './css/index.css'
import './css/prism-okaidia.css'
import { ThemeProvider } from 'styled-components'
import Helmet from 'react-helmet'
import React from 'react'
import config from '../../data/SiteConfig'
import theme from './theme'

export default class MainLayout extends React.Component {
  render() {
    const { children } = this.props
    return (
      <div>
        <Helmet>
          <title>{config.siteTitle}</title>
          <meta name="description" content={config.siteDescription} />
        </Helmet>
        <ThemeProvider theme={theme}>{children()}</ThemeProvider>
      </div>
    )
  }
}
