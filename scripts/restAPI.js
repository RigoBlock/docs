const atob = require('atob')
const axios = require('axios')
const fetch = require('node-fetch')
const fs = require('fs')

const headers = {
  Authorization: `bearer f001853260be2447e36917a7ce4c7512c63f8562`
}

const getData = async () => {
  const masterBranch = await fetch(
    'https://api.github.com/repos/RigoBlock/rigoblock-monorepo/branches/master',
    {
      headers
    }
  ).then(res => res.json())
  const treeSha = masterBranch.commit.sha
  const allFiles = await fetch(
    `https://api.github.com/repos/RigoBlock/rigoblock-monorepo/git/trees/${treeSha}?recursive=1`,
    {
      headers
    }
  ).then(res => res.json())
  const re = /\.md$/
  const markdowns = allFiles.tree.filter(file => file.path.match(re))
  markdowns.map(async markdown => {
    const { path, sha } = markdown
    const content = await fetchContentAndWrite(sha)
    const fileName = path.split('/').pop()
    const data =
      `---\ntitle: "Contracts"\ncategory: "packages"\n---\n\n` + content
    return fs.writeFile(`output/${fileName}`, data, 'utf8', err =>
      err ? console.error(err) : console.log(`${fileName} saved!`)
    )
  })
  // const content = atob(response.content)
  // console.log(content)
}

// const baseURL = 'https://api.github.com/repos/RigoBlock/rigoblock-monorepo/git/blobs/f6122066ecf983c9cd5bbce92997d5a2141408f3'

const fetchContentAndWrite = async blobSha => {
  const url = `https://api.github.com/repos/RigoBlock/rigoblock-monorepo/git/blobs/${blobSha}`
  const response = await fetch(url, {
    headers
  }).then(res => res.json())
  return atob(response.content)
}

getData()
