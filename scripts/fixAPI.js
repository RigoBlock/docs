const clk = require('chalk')
const fs = require('fs')
const { promisify } = require('util')

const glob = promisify(require('glob'))

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const fixAPIdocs = async () => {
  const docsList = await glob('content/**/*.md')
  console.log(docsList)

  const promises = docsList.map(async doc => {
    let content = (await readFile(doc)).toString()
    content = content.replace('../README', '../api')
    return writeFile(doc, content)
  })
  await Promise.all(promises)
  console.log(clk.green('Fixed all readme links.'))
}

fixAPIdocs()
