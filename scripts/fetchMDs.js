const get = require('lodash/get')
const groupBy = require('lodash/groupBy')
const { fetchJSON, postJSON, withSpinner } = require('./utils')
const fs = require('fs-extra')
const changeCase = require('change-case')
const path = require('path')

const FRONTMATTER_REGEXP = /^((---)$([\s\S]*?)^(?:\2|\.\.\.)\s*$(?:\n)?)/m

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

const fetchFileContent = async (repo, path) => {
  const GRAPHQL_URL = 'https://api.github.com/graphql'
  const query = `{
    repository(owner: "RigoBlock", name: "${repo}") {
      object(expression:"feature/monorepo-guides:${path}") {
        ... on Blob {
          text
        }
      }
    }
  }`
  return postJSON(GRAPHQL_URL, { query })
}

const fetchAllMarkdowns = async (repo, folderPath, package = '') => {
  const REST_URL = 'https://api.github.com/repos/RigoBlock'
  const GRAPHQL_URL = 'https://api.github.com/graphql'
  const query = `{
    repository(owner: "RigoBlock", name: "${repo}") {
      object(expression:"feature/monorepo-guides:${folderPath}") {
        oid
      }
    }
  }`
  // get tree id of the folder
  let response = await postJSON(GRAPHQL_URL, { query })
  const tree = get(response, 'data.repository.object.oid', '')

  // get all markdown paths in folder recursively
  const treeUrl = `${REST_URL}/${repo}/git/trees/${tree}?recursive=1`
  response = await fetchJSON(treeUrl)
  const markdowns = response.tree.filter(
    obj =>
      !obj.path.includes('examples') &&
      (obj.path.includes('.md') || obj.path.includes('.svg'))
  )

  const markdownsContentPromises = markdowns.map(async obj => {
    const response = await fetchFileContent(repo, `${folderPath}/${obj.path}`)
    const data = get(response, 'data.repository.object.text', '')
    const pathArr = obj.path.split('/')
    const folder = pathArr.length > 1 ? pathArr[pathArr.length - 2] : ''
    const matches = data.match(FRONTMATTER_REGEXP) || ['']
    const category = matches
      .pop()
      .split('category: ')
      .pop()
      .trim()
      .replace(/\"/g, '')
    if (!package && folderPath.includes('packages')) {
      const folderArr = folderPath.split('/')
      package = folderArr[folderArr.indexOf('packages') + 1]
    }

    return {
      title: getFileName(obj.path),
      content: data,
      path: obj.path.replace('docs', ''),
      category: category || '',
      package,
      folder
    }
  })
  return Promise.all(markdownsContentPromises)
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

const getTitle = markdown => {
  const titleRegexp = /\n\# (.+)/
  const typedocTitleRegexp = /[^=\n]*(?=\n===)/
  let title
  const normalTitle = (markdown.content.match(titleRegexp) || []).pop()
  const typedocTitle = (markdown.content.match(typedocTitleRegexp) || [])
    .filter(val => !!val)
    .pop()

  title =
    normalTitle ||
    typedocTitle ||
    changeCase.titleCase(getFileName(markdown.path))
  return title.trim()
}

const writeMarkdowns = (markdownArray = []) => {
  const contentFolder = __dirname + '/../content'
  const writeMarkdown = markdown => {
    const path = `${contentFolder}/${markdown.path}`
    let content = markdown.content.replace(/\.md/gi, '')
    let title = getTitle(markdown)
    let tocClasses = []
    if (title.includes(':')) {
      let [type, newTitle] = title ? title.split(':') : ['', markdown.title]
      tocClasses = [type]
      const titleArr = newTitle.split('/')
      if (titleArr.length > 1) {
        tocClasses = [...tocClasses, ...titleArr.slice(0, titleArr.length - 1)]
      }
      newTitle = newTitle.split('/').pop()
      title = changeCase.title(newTitle.replace(/\"/, '')).trim()
    }

    tocClasses = tocClasses.map(el =>
      changeCase.paramCase(el.replace(/\"/gi, '').trim())
    )

    const matches = content.match(FRONTMATTER_REGEXP)
    const frontmatter = matches ? matches[3] : null
    if (!frontmatter) {
      const data = [
        '---',
        `title: "${title}"`,
        `folder: "${markdown.folder}"`,
        `package: "${markdown.package}"`,
        `tocClasses: "${tocClasses.join(' ')}"`,
        '---',
        '',
        '',
        content
      ].join('\n')

      return fs.outputFile(path, data, err => (err ? console.error(err) : null))
    }
    const newFrontmatter =
      [
        '',
        `title: "${title}"`,
        `folder: "${markdown.folder}"`,
        `package: "${markdown.package}"`,
        `tocClasses: "${tocClasses.join(' ')}"`
      ].join('\n') + frontmatter
    content = content.replace(frontmatter, newFrontmatter)
    return fs.outputFile(path, content, err =>
      err ? console.error(err) : null
    )
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
  const { repo, folderPath } = require('minimist')(process.argv.slice(2))
  let markdowns = []
  if (isString(repo) && isString(folderPath)) {
    markdowns = await withSpinner(
      fetchAllMarkdowns(repo, folderPath),
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
