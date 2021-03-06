const { createFilePath } = require('gatsby-source-filesystem')
const path = require('path')

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === 'MarkdownRemark') {
    const slug = createFilePath({
      node,
      getNode,
      basePath: 'content',
      trailingSlash: false
    })
    let folder = ''
    if (slug.indexOf('/') !== -1) {
      const arr = slug.split('/')
      folder = arr[arr.length - 2]
    }
    createNodeField({ node, name: 'slug', value: slug })

    createNodeField({ node, name: 'folder', value: folder })
  }
}

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators
  const searchPage = path.resolve('src/pages/search.jsx')
  const documentPage = path.resolve('src/templates/document.jsx')

  createPage({
    path: 'search',
    component: searchPage,
    context: {
      slug: '/search'
    }
  })

  return new Promise((resolve, reject) => {
    resolve(
      graphql(
        `
          {
            allMarkdownRemark {
              edges {
                node {
                  frontmatter {
                    title
                    category
                  }
                  fields {
                    slug
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors)
        }

        result.data.allMarkdownRemark.edges.forEach(edge => {
          const { slug } = edge.node.fields
          const { category } = edge.node.frontmatter
          createPage({
            path: slug,
            component: documentPage,
            context: {
              slug,
              category
            }
          })
        })
      })
    )
  })
}

exports.modifyWebpackConfig = ({ config, stage }) => {
  if (stage === 'build-javascript') {
    // turn off source-maps
    config.merge({ devtool: false })
  }
}
