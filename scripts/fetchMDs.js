const get = require('lodash/get')
const { fetchJSON, postJSON, withSpinner } = require('./utils')
const fs = require('fs-extra')
const changeCase = require('change-case')

const getMonorepoPackageNames = async () => {
  const REST_URL = 'https://api.github.com/repos/RigoBlock/rigoblock-monorepo'
  const packagesTreeUrl = await fetchJSON(`${REST_URL}/git/trees/HEAD`).then(
    res => res.tree.filter(obj => obj.path === 'packages').pop().url
  )
  const packageNames = await fetchJSON(packagesTreeUrl).then(res =>
    res.tree.map(pkg => pkg.path)
  )
  return packageNames
}

const getFileName = path => {
  const pathArray = path.split('/')
  let fileName = pathArray.pop()
  if (fileName === 'README.md' && pathArray.length) {
    const newName = pathArray.pop()
    fileName = newName
  }
  fileName = fileName.split('.').shift()
  return fileName
}

const fetchGraphQL = async (repo, path) => {
  const GRAPHQL_URL = 'https://api.github.com/graphql'
  const query = `{
    repository(owner: "RigoBlock", name: "${repo}") {
      object(expression:"master:${path}") {
        ... on Blob {
          text
        }
      }
    }
  }`
  return postJSON(GRAPHQL_URL, { query })
}

const getRawMarkdowns = async packagesArray => {
  const linkRegexp = /(?<=\().*\.md(?=\))/g
  // readmePromises.push(fetchGraphQL('kb', 'README.md', 'Index'))
  // return Promise.all(readmePromises)
  const readmePromises = packagesArray.map(async pkg => {
    const response = await fetchGraphQL(
      'rigoblock-monorepo',
      `packages/${pkg}/README.md`,
      pkg
    )
    if (!response.data.repository.object) {
      return null
    }
    const data = get(markdownObj, 'data.repository.object.text', '')
    const readmeLinks = data.match(linkRegexp)
    let children = []
    if (readmeLinks) {
      childrenPromises = readmeLinks.map(async link => {
        const fileName = getFileName(link)
        console.log(fileName)
        const response = await fetchGraphQL(markdownObj.repo, link)
        const { text } = response.data.repository.object
        return {
          title: fileName,
          content: text,
          path: link
        }
      })
      children = await Promise.all(childrenPromises)
    }
    return {
      title,
      content,
      path,
      children
    }
  })
}

const getChildMarkdowns = rawMarkdowns => {
  const linkRegexp = /(?<=\().*\.md(?=\))/g
  rawMarkdowns.map(async markdownObj => {
    const data = get(markdownObj, 'data.repository.object.text', '')
    console.log('DATA', !!data)
    if (data) {
      const readmeLinks = data.match(linkRegexp)
      let children = []
      if (readmeLinks) {
        childrenPromises = readmeLinks.map(async link => {
          const fileName = getFileName(link)
          console.log(fileName)
          const response = await fetchGraphQL(markdownObj.repo, link)
          const { text } = response.data.repository.object
          return {
            title: fileName,
            content: text,
            path: link
          }
        })
        children = await Promise.all(childrenPromises)
      }
      return {
        title: markdownObj.name,
        content: data,
        path: `${markdownObj.name}.md`,
        children
      }
    }
  })
}

// const writeMarkdowns = markdownArray => {
//   const writeMarkdown = (markdown, category) => {
//     const mdFolder = __dirname + '/../content/docs/'
//     const path = mdFolder + markdown.path
//     const content = markdown.content.replace(/\.md(?=\))/gi, '')
//     const data =
//       `---\ntitle: "${changeCase.title(
//         markdown.title
//       )}"\ncategory: "${category}"\n---\n\n` + content
//     return fs.outputFile(path, data, err => (err ? console.error(err) : null))
//   }

//   const markdownPromises = markdownArray.map(markdown => {
//     const promiseArray = []
//     promiseArray.push(writeMarkdown(markdown, 'packages'))
//     if (markdown.children.length) {
//       markdown.children.map(markdown =>
//         promiseArray.push(writeMarkdown(markdown, 'packages'))
//       )
//     }
//     return Promise.all(promiseArray)
//   })

//   return Promise.all(markdownPromises)
// }

// const writeTOC = async markdowns => {
//   const jsonPath = __dirname + '/../content/docs/table_of_contents.json'
//   fs.ensureFileSync(jsonPath)
//   const getMarkdownObj = markdown => ({
//     title: markdown.title,
//     entry: `./${markdown.path}`
//   })
//   const documents = markdowns.map(md => {
//     if (!md.children.length) {
//       return getMarkdownObj(md)
//     }
//     const obj = getMarkdownObj(md)
//     const otherDocs = md.children.map(md => getMarkdownObj(md))
//     return { ...obj, otherDocs }
//   })

//   const JSON = {
//     id: 'table-of-contents',
//     contents: [
//       {
//         title: 'Packages',
//         documents
//       }
//     ]
//   }
//   return fs.writeJson(jsonPath, JSON, { spaces: 2 }, err =>
//     err ? console.error('ERROR 2', err) : null
//   )
// }

const fetchREADMEs = async () => {
  // const packages = await withSpinner(
  //   getMonorepoPackageNames(),
  //   'Fetching monorepo package names',
  //   'Done!'
  // )
  const packages = await getMonorepoPackageNames()
  // let rawMarkdowns = await withSpinner(
  //   getRawMarkdowns(packages),
  //   'Fetching raw markdowns',
  //   'Done!'
  // )
  let rawMarkdowns = await getRawMarkdowns(packages)
  rawMarkdowns = rawMarkdowns.filter(val => !!val)

  const markdowns = await getChildMarkdowns(rawMarkdowns)

  // await withSpinner(
  //   writeMarkdowns(markdowns),
  //   'Writing markdown files',
  //   'Done!'
  // )

  // await withSpinner(
  //   writeTOC(markdowns),
  //   'Writing JSON table of contents',
  //   'Done!'
  // )
}

fetchREADMEs()
