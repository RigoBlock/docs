const atob = require('atob')
const fetch = require('node-fetch')
const fs = require('fs')

const baseUrl = 'https://api.github.com/repos/RigoBlock/rigoblock-monorepo/'

const getData = async () => {
  const masterBranch = await fetchJSON(`${baseUrl}branches/master`)
  const treeSha = masterBranch.commit.sha
  const allFiles = await fetchJSON(`${baseUrl}git/trees/${treeSha}?recursive=1`)
  const re = /\.md$/
  const markdowns = allFiles.tree.filter(file => file.path.match(re))

  markdowns.map(async markdown => {
    const { path, sha } = markdown
    const content = await fetchContentAndWrite(sha)
    const fileName = getFileName(path)
    const data =
      `---\ntitle: "${fileName
        .split('.')
        .shift()}"\ncategory: "packages"\n---\n\n` + content
    return fs.writeFile(`output/${fileName}`, data, 'utf8', err =>
      err ? console.error(err) : console.log(`${fileName} saved!`)
    )
  })
}

const fetchJSON = url => {
  const headers = {
    Authorization: `bearer f001853260be2447e36917a7ce4c7512c63f8562`
  }
  return fetch(url, {
    headers
  }).then(res => res.json())
}

const fetchContentAndWrite = async blobSha => {
  const response = await fetchJSON(`${baseUrl}git/blobs/${blobSha}`)
  return atob(response.content)
}

const getFileName = path => {
  const pathArray = path.split('/')
  let fileName = pathArray.pop()
  if (fileName === 'README.md' && pathArray.length) {
    const newName = pathArray.pop()
    fileName = `${newName}.md`
  }
  return fileName
}

getData()
