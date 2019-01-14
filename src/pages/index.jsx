import './index.scss'
import { Redirect } from 'react-router'
import React from 'react'

const Index = props => {
  const { edges } = props.data.allMarkdownRemark
  const firstUrl = edges[0].node.fields.slug
  return <Redirect to={firstUrl} />
}

export default Index

/* eslint no-undef: "off" */
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(limit: 1) {
      edges {
        node {
          id
          fields {
            slug
          }
        }
      }
    }
  }
`
