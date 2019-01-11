const clk = require('chalk')
const fs = require('fs')
const { promisify } = require('util')

const glob = promisify(require('glob'))

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

const fixLinks = async () => {
  console.log(clk.green('Fixing links...'))
  const docsList = await glob('content/**/*.md')

  const promises = docsList.map(async doc => {
    let content = (await readFile(doc)).toString()
    content = content.replace('../README', `../quick_start`)
    return writeFile(doc, content)
  })
  await Promise.all(promises)
  console.log(clk.green('Fixed all readme links.'))
}

fixLinks()
