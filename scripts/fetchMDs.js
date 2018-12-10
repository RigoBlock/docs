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

const getMarkdownsContent = async packagesArray => {
  const markdownPromises = packagesArray.map(async pkg => {
    const repo = 'rigoblock-monorepo'
    const basePath = `packages/${pkg}/`
    const response = await fetchGraphQL(
      'rigoblock-monorepo',
      `${basePath}README.md`
    )
    return parseMarkdown(pkg, repo, response, basePath)
  })
  const kbResponse = await fetchGraphQL('kb', 'README.md')
  markdownPromises.push(parseMarkdown('Index', 'kb', kbResponse))
  const results = await Promise.all(markdownPromises)
  return results.filter(val => !!val)
}

const parseMarkdown = async (name, repo, responseObj, basePath = '') => {
  if (!responseObj.data.repository.object) {
    return null
  }
  const linkRegexp = /(?<=\().*\.md(?=\))/g
  const data = get(responseObj, 'data.repository.object.text', '')
  const readmeLinks = data.match(linkRegexp)
  let children = []
  if (readmeLinks) {
    childrenPromises = readmeLinks
      .map(async link => {
        const fileName = getFileName(link)
        const response = await fetchGraphQL(repo, basePath + link)
        if (!response.data.repository.object) {
          return null
        }
        const { text } = response.data.repository.object
        return {
          title: fileName,
          content: text,
          path: link,
          repo
        }
      })
      .filter(val => !!val)
    children = await Promise.all(childrenPromises)
  }
  return {
    title: name,
    content: data,
    path: `${name}.md`,
    repo,
    children
  }
}

const writeMarkdowns = markdownArray => {
  const writeMarkdown = markdown => {
    const mdFolder = __dirname + '/../content/docs/'
    const path = mdFolder + markdown.path
    const content = markdown.content.replace(/\.md(?=\))/gi, '')
    const data =
      `---\ntitle: "${changeCase.title(markdown.title)}"\ncategory: "${
        markdown.repo
      }"\n---\n\n` + content
    return fs.outputFile(path, data, err => (err ? console.error(err) : null))
  }

  const markdownPromises = markdownArray.map(markdown => {
    const promiseArray = []
    if (markdown.children.length) {
      markdown.children.map(markdown =>
        promiseArray.push(writeMarkdown(markdown))
      )
    }
    return Promise.all(promiseArray)
  })

  return Promise.all(markdownPromises)
}

const writeTOC = async markdowns => {
  const monorepoMd = markdowns.filter(md => md.repo === 'rigoblock-monorepo')
  const kbMd = markdowns.filter(md => md.repo === 'kb')
  const jsonPath = __dirname + '/../content/docs/table_of_contents.json'
  fs.ensureFileSync(jsonPath)
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
      const children = md.children.map(md => getMarkdownObj(md))
      return { ...obj, children }
    })
  }

  const JSON = {
    id: 'table-of-contents',
    contents: [
      {
        title: 'Packages',
        documents: mapMarkdowns(monorepoMd)
      },
      {
        title: 'Knowledge Base',
        documents: mapMarkdowns(kbMd)
      }
    ]
  }
  return fs.writeJson(jsonPath, JSON, { spaces: 2 }, err =>
    err ? console.error('ERROR 2', err) : null
  )
}

const fetchREADMEs = async () => {
  const packageNames = await withSpinner(
    getMonorepoPackageNames(),
    'Fetching monorepo package names',
    'Done!'
  )
  const markdowns = await withSpinner(
    getMarkdownsContent(packageNames),
    'Fetching markdown contents',
    'Done!'
  )

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
