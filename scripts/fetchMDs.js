const get = require('lodash/get')
const groupBy = require('lodash/groupBy')
const { fetchJSON, postJSON, withSpinner } = require('./utils')
const fs = require('fs-extra')
const changeCase = require('change-case')
const path = require('path')

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

const isMarkdown = pathStr => path.extname(pathStr) === '.md'

const fetchGraphQL = async (repo, path) => {
  const GRAPHQL_URL = 'https://api.github.com/graphql'
  const query = `{
    repository(owner: "RigoBlock", name: "${repo}") {
      object(expression:"feature/rollback-readme:${path}") {
        ... on Blob {
          text
        }
      }
    }
  }`
  return postJSON(GRAPHQL_URL, { query })
}

const parseMarkdown = async (
  name,
  repo,
  responseObj,
  category,
  basePath = ''
) => {
  if (!responseObj.data.repository.object) {
    return null
  }
  const linkRegexp = /(?<=\().*\.md(?=\))/g
  const svgRegexp = /(?<=\().*\.svg(?=\))/g
  const data = get(responseObj, 'data.repository.object.text', '')
  const readmeLinks = data.match(linkRegexp)
  const svgLinks = data.match(svgRegexp)
  let children = [].concat(readmeLinks, svgLinks).filter(val => !!val)
  if (children.length) {
    childrenPromises = children.map(async link => {
      const fileName = getFileName(link)
      const response = await fetchGraphQL(repo, basePath + link)
      if (!response.data.repository.object) {
        return null
      }
      const { text } = response.data.repository.object
      return {
        title: fileName,
        content: text,
        category: category || repo,
        path: link,
        repo
      }
    })
    children = await Promise.all(childrenPromises)
  }
  return {
    title: name,
    content: data,
    path: `${name}.md`,
    category: category || repo,
    repo,
    children: children.filter(val => !!val)
  }
}

const getMarkdownsContent = async packagesArray => {
  const markdownPromises = await Promise.all(
    packagesArray.map(async pkg => {
      const repo = 'rigoblock-monorepo'
      const basePath = `packages/${pkg}/`
      const response = await fetchGraphQL(
        'rigoblock-monorepo',
        `${basePath}README.md`
      )
      return parseMarkdown(pkg, repo, response, 'Packages', basePath)
    })
  )
  const kbResponse = await fetchGraphQL('kb', 'README.md')
  markdownPromises.push(
    parseMarkdown('reference', 'kb', kbResponse, 'Knowledge Base')
  )
  const results = await Promise.all(markdownPromises)
  return results.filter(val => !!val)
}

const writeMarkdowns = markdownArray => {
  const contentFolder = __dirname + '/../content/'
  const writeMarkdown = markdown => {
    const path = contentFolder + markdown.path
    const content = markdown.content.replace(/\.md(?=\))/gi, '')
    const data =
      `---\ntitle: "${changeCase.title(markdown.title)}"\ncategory: "${
        markdown.category
      }"\n---\n\n` + content
    return fs.outputFile(path, data, err => (err ? console.error(err) : null))
  }

  const writeSVG = svg => {
    const path = contentFolder + svg.path
    fs.outputFile(path, svg.content, err => (err ? console.error(err) : null))
  }

  const markdownPromises = markdownArray.map(markdown => {
    const promiseArray = []
    promiseArray.push(writeMarkdown(markdown))
    if (markdown.children.length) {
      markdown.children.map(child =>
        isMarkdown(child.path)
          ? promiseArray.push(writeMarkdown(child))
          : promiseArray.push(writeSVG(child))
      )
    }
    return Promise.all(promiseArray)
  })

  return Promise.all(markdownPromises)
}

const writeTOC = async markdowns => {
  const mapMarkdowns = markdownArr => {
    const getMarkdownObj = markdown => ({
      title: markdown.title,
      entry: `./${markdown.path}`
    })
    return markdownArr.map(md => {
      if (!md.children.length) {
        return getMarkdownObj(md)
      }
      const obj = getMarkdownObj(md)
      const children = md.children
        .map(child => (isMarkdown(child.path) ? getMarkdownObj(child) : null))
        .filter(val => !!val)
      return { ...obj, children }
    })
  }
  const jsonPath = __dirname + '/../content/table_of_contents.json'
  fs.ensureFileSync(jsonPath)

  const grouped = groupBy(markdowns, 'category')
  const contents = Object.entries(grouped).map(([key, value]) => ({
    title: key,
    documents: mapMarkdowns(value)
  }))

  const JSON = {
    id: 'table-of-contents',
    contents
  }
  return fs.writeJson(jsonPath, JSON, { spaces: 2 }, err =>
    err ? console.error('ERROR 2', err) : null
  )
}
const isString = str => !!str && typeof str === 'string'

const fetchREADMEs = async () => {
  const { repo, filePath } = require('minimist')(process.argv.slice(2))
  let markdowns = []
  if (isString(repo) && isString(filePath)) {
    const response = await fetchGraphQL(repo, filePath)
    let basePath = ''
    if (filePath.indexOf('/') !== -1) {
      const pathArr = filePath.split('/')
      basePath = pathArr.slice(0, pathArr.length - 1).join('/') + '/'
    }
    const markdownContent = await parseMarkdown(
      'api',
      'rigoblock-monorepo',
      response,
      'Contracts API',
      basePath
    )
    if (!markdownContent) {
      throw new Error(
        'File not found. Make sure the file path was spelled correctly.'
      )
    }
    markdowns.push(markdownContent)

    await withSpinner(
      writeMarkdowns(markdowns),
      'Writing markdown files',
      'Done!'
    )
  } else {
    const packageNames = await withSpinner(
      getMonorepoPackageNames(),
      'Fetching monorepo package names',
      'Done!'
    )
    markdowns = await withSpinner(
      getMarkdownsContent(packageNames),
      'Fetching markdown contents',
      'Done!'
    )
    await withSpinner(
      writeMarkdowns(markdowns),
      'Writing markdown files',
      'Done!'
    )
  }

  await withSpinner(
    writeTOC(markdowns),
    'Writing JSON table of contents',
    'Done!'
  )
}

fetchREADMEs()
