const fetch = require('node-fetch')
const fs = require('fs')
const get = require('lodash/get')
const { fetchJSON, postJSON } = require('./utils')

// /branches/master
const fetchREADMEs = async () => {
  const GRAPHQL_URL = 'https://api.github.com/graphql'
  const packages = await getPackageNames()
  const linkRegexp = /(?<=\().*\.md(?=\))/g
  // const linkRegexp = /\]\((.+\.md)\)/i // not working, only getting one link per file cause of no global
  packages.map(async pkg => {
    const query = `{
      repository(owner: "RigoBlock", name: "rigoblock-monorepo") {
        object(expression:"master:packages/${pkg}/README.md") {
          ... on Blob {
            text
          }
        }
      }
    }`
    const response = await postJSON(GRAPHQL_URL, { query })
    // fs.
    const data =
      response.data.repository.object && response.data.repository.object.text
    const links = data.match(linkRegexp)
    // console.log(links)
    // if (links) {
    //   links.map()
    // }
  })
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

fetchREADMEs()
