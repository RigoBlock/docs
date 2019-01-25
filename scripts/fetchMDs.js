const get = require('lodash/get')
const groupBy = require('lodash/groupBy')
const { fetchJSON, postJSON, withSpinner } = require('./utils')
const fs = require('fs-extra')
const changeCase = require('change-case')
const path = require('path')

const FRONTMATTER_REGEXP = /^((---)$([\s\S]*?)^(?:\2|\.\.\.)\s*$(?:\n)?)/m
const REST_URL = 'https://api.github.com/repos/RigoBlock'
const GRAPHQL_URL = 'https://api.github.com/graphql'

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

const getTreeId = async (repo, path) => {
  const query = `{
    repository(owner: "RigoBlock", name: "${repo}") {
      object(expression:"master:${path}") {
        oid
      }
    }
  }`
  const response = await postJSON(GRAPHQL_URL, { query })
  return get(response, 'data.repository.object.oid', '')
}

// const getMonorepoPackageNames = async () => {
//   const repo = 'rigoblock-monorepo'
//   const tree = await getTreeId(repo, 'packages')
//   const treeUrl = `${REST_URL}/${repo}/git/trees/${tree}`
//   const packageNames = await fetchJSON(treeUrl).then(res =>
//     res.tree.map(el => ({
//       repo,
//       path: `packages/${el.path}`
//     }))
//   )
//   return packageNames
// }

const fetchAllMarkdowns = async (repo, folderPath, packageName = '') => {
  const tree = await getTreeId(repo, folderPath)

  // get all markdown paths in folder recursively
  const treeUrl = `${REST_URL}/${repo}/git/trees/${tree}?recursive=1`
  const markdowns = await fetchJSON(treeUrl).then(res =>
    res.tree.filter(
      obj =>
        !obj.path.includes('examples/') &&
        (obj.path.includes('.md') || obj.path.includes('.svg'))
    )
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
    if (!packageName && folderPath.includes('packages')) {
      const folderArr = folderPath.split('/')
      packageName = folderArr[folderArr.indexOf('packages') + 1]
    }

    return {
      title: getFileName(obj.path),
      content: data,
      path: obj.path.replace('docs', ''),
      category: category || '',
      package: packageName,
      folder
    }
  })
  return Promise.all(markdownsContentPromises)
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

const fetchREADMEs = async () => {
  if (process.env.FETCH_REFERENCE) {
    const referenceMarkdowns = await withSpinner(
      fetchAllMarkdowns('rigoblock-monorepo', 'packages/api/docs'),
      'Fetching api reference markdown files',
      'Done!'
    )
    const guidesMarkdowns = await withSpinner(
      fetchAllMarkdowns('rigoblock-monorepo', 'guides'),
      'Fetching guides markdown files',
      'Done!'
    )
    const allMarkdowns = [...referenceMarkdowns, ...guidesMarkdowns]
    await withSpinner(
      writeMarkdowns(allMarkdowns),
      'Writing markdown files',
      'Done!'
    )
    await withSpinner(
      writeTOC(allMarkdowns),
      'Writing JSON table of contents',
      'Done!'
    )
  } else {
    return null
  }
}

fetchREADMEs()
