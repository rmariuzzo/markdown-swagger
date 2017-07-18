'use strict'

const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const print = require('chalk-printer')
const command = require('meow')
const columnify = require('columnify')

const cli = command(`
  Usage
    $ markdown-swagger <swagger.yaml> <markdown.md>

  Examples
    $ markdown-swagger ./api/swagger/swagger.yaml ./README.md
`)

const [source, target] = cli.input

Promise.resolve()
  .then(() => shouldBeDefined(source, 'The source (swagger) file should be specified.'))
  .then(() => shouldBeDefined(target, 'The target (markdown) file should be specified.'))
  .then(() => readSource(source))
  .then((yaml) => generateTable(yaml))
  .then((data) => console.log(data))
  // .then((table) => updateTable(table, target))
  .catch((error) => {
    print.error(error)
    process.exit(1)
  })

function shouldBeDefined(obj, message) {
  if (obj === undefined) {
    throw new Error(message)
  }
}

function readSource(source) {
  return fs.readFile(source, 'utf-8')
    .then((data) => yaml.safeLoad(data))
    .catch((error) => {
      if (error.code === 'ENOENT') {
        throw new Error(`${source} doesn't exist`)
      }

      throw error;
    })
}

const methods = ['get', 'post', 'put', 'delete', 'patch', 'options']
const headings = {
  endpoint: 'Endpoint',
  method: 'Method',
  auth: 'Auth?',
  description: 'Description'
}

function generateTable(yaml) {
  const paths = yaml.paths || []
  const data = []
  Object.keys(paths).forEach((path) => {
    const endpoint = paths[path]
    const method = find(Object.keys(endpoint), methods)
    const security = endpoint[method].security
    const description = endpoint[method].description
    data.push({
      endpoint: `\`${path}\``,
      method: method.toUpperCase(),
      auth: security ? 'Yes' : 'No',
      description,
    })
  })
  const table = columnify(data, {
    columnSplitter: ' | ',
    headingTransform: (data) => headings[data],
  })
  const rows = table.split('\n')
  const divider = rows[0].replace(/[^\|]/g, '-').replace(/-\|-/g, ' | ')
  rows.splice(1, 0, divider)
  return rows.join('\n')
}

function find(a = [], b = []) {
  let found = undefined
  a.find((ea) => {
    const ib = b.indexOf(ea)
    if (ib > -1) {
      found = b[ib]
    }
    return found !== undefined
  })
  return found
}
