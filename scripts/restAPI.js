const atob = require('atob')
const axios = require('axios')
const fetch = require('node-fetch')

const getData = async () => {
  const headers = {
    Authorization: `bearer f001853260be2447e36917a7ce4c7512c63f8562`
  }

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
  console.log(markdowns)
  // const content = atob(response.content)
  // console.log(content)
}

// const baseURL = 'https://api.github.com/repos/RigoBlock/rigoblock-monorepo/git/blobs/f6122066ecf983c9cd5bbce92997d5a2141408f3'

getData()
