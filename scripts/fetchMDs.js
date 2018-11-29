// const { GITHUB_ACCESS_TOKEN } = require('./constants')
const fs = require('fs')
const axios = require('axios')

const graphQLQuery = async () => {
  const axiosGraphQL = axios.create({
    baseURL: 'https://api.github.com/graphql',
    headers: {
      Authorization: `bearer f001853260be2447e36917a7ce4c7512c63f8562`
    }
  })
  const query = `{
    repository(owner: "RigoBlock", name: "rigoblock-monorepo") {
      object(expression:"master:packages/dapp/README.md") {
        ... on Blob {
          text
        }
      }
    }
  }`
  const { data } = await axiosGraphQL.post('', { query }).then(res => res.data)

  return fs.writeFileSync('prova.md', data.repository.object.text, (err, res) =>
    err ? console.error(err) : console.log(res)
  )
}

graphQLQuery()
