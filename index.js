#!/usr/bin/env node

'use strict'

const fs = require('fs-extra')
const yaml = require('js-yaml')
const print = require('chalk-printer')
const command = require('meow')
const columnify = require('columnify')
const xmlComment = require('xml-comment-api')

// Command line definition.
const cli = command(`
  Usage
    $ markdown-swagger <swagger.yaml> <markdown.md>

  Examples
    $ markdown-swagger ./api/swagger/swagger.yaml ./README.md
`)

const [source, target] = cli.input

Promise.resolve()
  .then(() => source || Promise.reject('The swagger source file is required.'))
  .then(() => target || Promise.reject('The markdown target file is required.'))
  .then(() => readSwaggerFile(source))
  .then((swagger) => generateTable(swagger))
  .then((table) => updateMarkdownTable(table, target))
  .catch((error) => {
    print.error(error)
    process.exit(1)
  })

function readSwaggerFile(source) {
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
    const definedMethods = find(Object.keys(endpoint), methods)
    definedMethods.forEach((method) => {
      const security = endpoint[method].security
      const description = endpoint[method].description
      data.push({
        endpoint: `\`${path}\``,
        method: method.toUpperCase(),
        auth: security ? 'Yes' : 'No',
        description,
      })
    })
  })
  const table = columnify(data, {
    columnSplitter: ' | ',
    headingTransform: (data) => headings[data],
  })
  const rows = table.split('\n')
  const divider = rows[0].replace(/[^\|]/g, '-').replace(/-\|-/g, ' | ')
  rows.splice(1, 0, divider)
  return rows.map((row) => ` ${row}`).join('\n')
}

function find(a = [], b = []) {
  let found = []
  a.find((ea) => {
    const ib = b.indexOf(ea)
    if (ib > -1) {
      found.push(b[ib])
    }
  })
  return found
}

function updateMarkdownTable(table, target) {
  return fs.readFile(target, 'utf-8')
    .then((data) => {
      const updated = xmlComment(data).replace('markdown-swagger', `\n${table}\n`).contents()
      return fs.writeFile(target, updated)
    })
    .catch((error) => {
      if (error.code === 'ENOENT') {
        throw new Error(`${source} doesn't exist`)
      }

      throw error;
    })
}
