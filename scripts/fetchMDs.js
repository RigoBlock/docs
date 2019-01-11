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
  const split = fileName.split('.')
  return split.length > 1
    ? split.slice(0, split.length - 1).join('.')
    : split.pop()
}

const isMarkdown = pathStr => path.extname(pathStr) === '.md'

const fetchGraphQL = async (repo, path) => {
  const GRAPHQL_URL = 'https://api.github.com/graphql'
  const query = `{
    repository(owner: "RigoBlock", name: "${repo}") {
      object(expression:"feature/api-documentation:${path}") {
        ... on Blob {
          text
        }
      }
    }
  }`
  return postJSON(GRAPHQL_URL, { query })
}

const getChildrenLinks = content => {
  const linkRegexp = /(?<=\()[^\)]*\.md(?=\))/g
  const svgRegexp = /(?<=\()[^\)]*\.svg(?=\))/g
  const readmeLinks = content.match(linkRegexp)
  const svgLinks = content.match(svgRegexp)
  return [].concat(readmeLinks, svgLinks).filter(val => !!val)
}

const getBasePath = path => {
  let basePath = ''
  if (path.indexOf('/') !== -1) {
    const pathArr = path.split('/')
    basePath = pathArr.slice(0, pathArr.length - 1).join('/') + '/'
  }
  return basePath
}

const fetchMarkdowns = async (repo, filePath, category, name = '') => {
  const pathList = []
  async function getAllPaths(filePath) {
    const normPath = path.normalize(filePath)
    if (pathList.includes(normPath)) {
      return null
    }
    pathList.push(normPath)
    const response = await fetchGraphQL(repo, normPath)
    const data = get(response, 'data.repository.object.text', '')
    const basePath = getBasePath(normPath)
    let children = getChildrenLinks(data)
    if (children.length) {
      const promises = children.map(link => getAllPaths(basePath + link))
      await Promise.all(promises)
    }
    return
  }
  await getAllPaths(filePath)
  let basePath
  const markdownPromises = pathList.map(async (filePath, index) => {
    let isMain = false
    let fileName = getFileName(filePath)
    const { dir } = path.parse(filePath)
    if (index === 0) {
      basePath = dir ? dir + '/' : ''
      isMain = true
      if (name) {
        fileName = name
      }
    }
    const response = await fetchGraphQL(repo, filePath)
    if (!response.data.repository.object) {
      return null
    }
    const data = get(response, 'data.repository.object.text', '')
    const finalPath = filePath.replace(basePath, '')
    return {
      title: fileName,
      content: data,
      path: isMain ? `${fileName}.md` : finalPath,
      isMain,
      category,
      subCategory: basePath || dir,
      repo
    }
  })
  const results = await Promise.all(markdownPromises)
  return results.filter(val => !!val)
}

const getMarkdownsContent = async packagesArray => {
  const markdownPromises = await Promise.all(
    packagesArray.map(async pkg => {
      const repo = 'rigoblock-monorepo'
      const filePath = `packages/${pkg}/README.md`
      return fetchMarkdowns(repo, filePath, 'Packages', pkg)
    })
  )
  markdownPromises.push(
    fetchMarkdowns('kb', 'README.md', 'Knowledge Base', 'reference')
  )
  const results = await Promise.all(markdownPromises)
  return results.reduce((acc, curr) => [...acc, ...curr], [])
}

const writeMarkdowns = markdownArray => {
  const contentFolder = __dirname + '/../content'
  const writeMarkdown = markdown => {
    const path = `${contentFolder}/${markdown.path}`
    const content = markdown.content.replace(/\.md/gi, '')
    const data =
      `---\ntitle: "${changeCase.title(markdown.title)}"\ncategory: "${
        markdown.category
      }"\nsubCategory: "${markdown.subCategory}"\n---\n\n` + content
    return fs.outputFile(path, data, err => (err ? console.error(err) : null))
  }

  const writeSVG = svg => {
    const path = `${contentFolder}/${svg.path}`
    fs.outputFile(path, svg.content, err => (err ? console.error(err) : null))
  }

  const markdownPromises = markdownArray.map(markdown =>
    isMarkdown(markdown.path) ? writeMarkdown(markdown) : writeSVG(markdown)
  )

  return Promise.all(markdownPromises)
}

const writeTOC = async markdowns => {
  const mapMarkdowns = markdownArr => {
    const onlyMarkdowns = markdownArr.filter(md => isMarkdown(md.path))
    const getMarkdownObj = md => {
      return {
        title: md.title,
        entry: `./${md.path}`
      }
    }
    return onlyMarkdowns.map(md => getMarkdownObj(md))
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
    markdowns = await withSpinner(
      fetchMarkdowns(repo, filePath, 'API Reference', 'quick_start'),
      'Fetching markdown files',
      'Done!'
    )

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
