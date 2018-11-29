const path = require('path')
const _ = require('lodash')
const webpackLodashPlugin = require('lodash-webpack-plugin')

exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators
  if (node.internal.type === 'MarkdownRemark') {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)
    const slug = `/${parsedFilePath.dir}/${_.kebabCase(parsedFilePath.name)}/`
    console.log('SLUG', slug)
    createNodeField({ node, name: 'slug', value: slug })
  }
}

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const lessonPage = path.resolve('src/templates/lesson.jsx')
    const categoryPage = path.resolve('src/templates/category.jsx')
    resolve(
      graphql(
        `
          {
            allMarkdownRemark {
              edges {
                node {
                  frontmatter {
                    title
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

        // const tagSet = new Set()
        // const categorySet = new Set()

        result.data.allMarkdownRemark.edges.forEach(edge => {
          // if (edge.node.frontmatter.category) {
          //   categorySet.add(edge.node.frontmatter.category)
          // }

          createPage({
            path: edge.node.fields.slug,
            component: lessonPage,
            context: {
              slug: edge.node.fields.slug
            }
          })
        })

        // const categoryList = Array.from(categorySet)
        // categoryList.forEach(category => {
        //   createPage({
        //     path: `/categories/${_.kebabCase(category)}/`,
        //     component: categoryPage,
        //     context: {
        //       category
        //     }
        //   })
        // })
      })
    )
  })
}

exports.modifyWebpackConfig = ({ config, stage }) => {
  if (stage === 'build-javascript') {
    config.plugin('Lodash', webpackLodashPlugin, null)
  }
}
