const fetch = require('node-fetch')

const postJSON = (url, body) =>
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `bearer f001853260be2447e36917a7ce4c7512c63f8562`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(r => r.json())

const fetchJSON = url =>
  fetch(url, {
    headers: {
      Authorization: `bearer f001853260be2447e36917a7ce4c7512c63f8562`
    }
  }).then(r => r.json())

module.exports = {
  fetchJSON,
  postJSON
}
