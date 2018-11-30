const fetch = require('node-fetch')
const fs = require('fs')
const { fetchJSON, postJSON } = require('./utils')

// /branches/master
const fetchREADMEs = async () => {
  const GRAPQL_URL = 'https://api.github.com/graphql'
  const REST_URL = 'https://api.github.com/repos/RigoBlock/rigoblock-monorepo'

  const treeUrl = await fetchJSON(`${REST_URL}/branches/master`).then(
    res => res.commit.commit.tree.url
  )
  const res = await fetchJSON(
    'https://api.github.com/repos/RigoBlock/rigoblock-monorepo/git/trees/09f15fb23a9275cd50954cfcd6aa80d22f8dd648'
  )

  console.log(res)
  // const linkRegexp = /(?<=\().*\.md(?=\))/g
  // const linkRegexp = /\]\((.+\.md)\)/i // not working, only getting one link per file cause of no global
  // const packages = ['dapp', 'api', 'exchange-connector', 'contracts']
  // packages.map(async pkg => {
  //   const query = `{
  //     repository(owner: "RigoBlock", name: "rigoblock-monorepo") {
  //       object(expression:"master:packages/${pkg}/README.md") {
  //         ... on Blob {
  //           text
  //         }
  //       }
  //     }
  //   }`
  //   const response = await postJSON(baseURL, { query })
  //   // fs.
  //   const data = response.data.repository.object.text
  //   const links = data.match(linkRegexp)
  //   if (links) {
  //     links.map()
  //   }
  // })
}

fetchREADMEs()
