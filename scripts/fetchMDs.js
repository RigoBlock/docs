const get = require('lodash/get')
const { fetchJSON, postJSON, withSpinner } = require('./utils')
const fs = require('fs-extra')
const changeCase = require('change-case')

const getMonorepoPackageNames = async () => {
  const REST_URL = 'https://api.github.com/repos/RigoBlock/rigoblock-monorepo'
  const packagesTreeUrl = await fetchJSON(`${REST_URL}/git/trees/HEAD`).then(
    res => res.tree.filter(obj => obj.path === 'packages').pop().url
  )
  const packages = await fetchJSON(packagesTreeUrl).then(res =>
    res.tree.map(pkg => pkg.path)
  )
  return packages
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

const fetchGraphQL = (repo, path) => {
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
  const readmePromises = packagesArray.map(async pkg =>
    fetchGraphQL('rigoblock-monorepo', `packages/${pkg}/README.md`)
  )
  readmePromises.push(fetchGraphQL('kb', 'README.md'))
  return Promise.all(readmePromises)
}

const writeMarkdowns = markdownArray => {
  const writeMarkdown = (markdown, category) => {
    const mdFolder = __dirname + '/../content/docs/'
    const path = mdFolder + markdown.path
    const content = markdown.content.replace(/\.md(?=\))/gi, '')
    const data =
      `---\ntitle: "${changeCase.title(
        markdown.title
      )}"\ncategory: "${category}"\n---\n\n` + content
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

const getChildMarkdowns = rawMarkdowns => {}

const fetchREADMEs = async () => {
  const packages = await withSpinner(
    getMonorepoPackageNames(),
    'Fetching monorepo package names',
    'Done!'
  )
  let rawMarkdowns = await withSpinner(
    getRawMarkdowns(packages),
    'Fetching raw markdowns',
    'Done!'
  )
  rawMarkdowns = rawMarkdowns.filter(val => !!val).push(kbReadme)

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

fetchREADMEs()
