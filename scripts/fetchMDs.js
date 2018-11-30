const get = require('lodash/get')
const { fetchJSON, postJSON, withSpinner } = require('./utils')
const fs = require('fs-extra')

const fetchREADMEs = async () => {
  const packages = await withSpinner(
    getPackageNames(),
    'Fetching package names',
    'Done!'
  )
  let markdowns = await withSpinner(
    getPackageREADMEs(packages),
    'Fetching README files content',
    'Done!'
  )
  markdowns = markdowns.filter(val => !!val)

  await withSpinner(
    writeMarkdowns(markdowns),
    'Writing markdown files',
    'Done!'
  )

  await withSpinner(
    writeTOC(markdowns),
    'Writing JSON table of contents',
    'Done!'
  )
}

const writeTOC = async markdowns => {
  const jsonPath = __dirname + '/../content/docs/table_of_contents.json'
  fs.ensureFileSync(jsonPath)
  const getMarkdownObj = markdown => ({
    title: markdown.title,
    entry: `./${markdown.path}`
  })
  const documents = markdowns.map(md => {
    if (!md.children.length) {
      return getMarkdownObj(md)
    }
    const obj = getMarkdownObj(md)
    const otherDocs = md.children.map(md => getMarkdownObj(md))
    return { ...obj, otherDocs }
  })

  const JSON = {
    id: 'table-of-contents',
    contents: [
      {
        title: 'Packages',
        documents
      }
    ]
  }
  return fs.writeJson(jsonPath, JSON, { spaces: 2 }, err =>
    err ? console.error('ERROR 2', err) : null
  )
}

const writeMarkdowns = markdownArray => {
  const writeMarkdown = (markdown, category) => {
    const mdFolder = __dirname + '/../content/docs/'
    const path = mdFolder + markdown.path
    const data =
      `---\ntitle: "${markdown.title}"\ncategory: "${category}"\n---\n\n` +
      markdown.content
    return fs.outputFile(path, data, err => (err ? console.error(err) : null))
  }

  const markdownPromises = markdownArray.map(markdown => {
    const promiseArray = []
    promiseArray.push(writeMarkdown(markdown, 'packages'))
    if (markdown.children.length) {
      markdown.children.map(markdown =>
        promiseArray.push(writeMarkdown(markdown, 'packages'))
      )
    }
    return Promise.all(promiseArray)
  })

  return Promise.all(markdownPromises)
}

const getPackageNames = async () => {
  const REST_URL = 'https://api.github.com/repos/RigoBlock/rigoblock-monorepo'

  const packagesTreeUrl = await fetchJSON(`${REST_URL}/git/trees/HEAD`).then(
    res => res.tree.filter(obj => obj.path === 'packages').pop().url
  )
  const packages = await fetchJSON(packagesTreeUrl).then(res =>
    res.tree.map(pkg => pkg.path)
  )
  return packages
}

const getPackageREADMEs = async packagesArray => {
  const GRAPHQL_URL = 'https://api.github.com/graphql'
  const linkRegexp = /(?<=\().*\.md(?=\))/g
  const readmePromises = packagesArray.map(async pkg => {
    const getQuery = path => `{
      repository(owner: "RigoBlock", name: "rigoblock-monorepo") {
        object(expression:"master:packages/${pkg}/${path}") {
          ... on Blob {
            text
          }
        }
      }
    }`
    const response = await postJSON(GRAPHQL_URL, {
      query: getQuery('README.md')
    })

    const data = get(response, 'data.repository.object.text', '')
    if (data) {
      const additionalLinks = data.match(linkRegexp)
      let children = []
      if (additionalLinks) {
        childrenPromises = additionalLinks.map(async link => {
          const fileName = getFileName(link)
          const response = await postJSON(GRAPHQL_URL, {
            query: getQuery(link)
          })
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
        title: pkg,
        content: data,
        path: `${pkg}.md`,
        children
      }
    }
    return null
  })
  return Promise.all(readmePromises)
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

fetchREADMEs()
