#! /usr/bin/env node
const fs = require('fs')
const glob = require('glob-promise')
const variables = require('./helpers/variables')
const log = require('./helpers/logger')
const constants = require('./helpers/constants')
const cleanPath = require('./helpers/clean-path')
const { removeDoubledSolidityVersion, getFirstPragma } = require('./helpers/remove-doubled-solidity-version')
const { removeDuplicatedExpHeaders, getFirstPragmaExp } = require('./helpers/remove-duplicated-experimental-headers')
const replaceAllImportsRecursively = require('./helpers/replace-all-imports-recursively')

flatten()

async function flatten() {
  const inputFileContent = await fs.readFileSync(variables.inputFilePath, 'utf8')
  let dir = variables.parentDir + constants.SLASH
  const isAbsolutePath = !dir.startsWith(constants.DOT)
  if (!isAbsolutePath) {
    dir = __dirname + constants.SLASH + dir
  }
  dir = cleanPath(dir)
  const path = variables.parentDir + constants.SOL
  const srcFiles = await getSourceFiles(dir, path)
  variables.srcFiles = srcFiles
  await replaceImports(inputFileContent, dir)
}

async function getSourceFiles(dir, path) {
  return await glob(path)
}

async function replaceImports(inputFileContent, dir) {
  const { pragma: firstPragma } = getFirstPragma(inputFileContent)
  let { pragmaExp: firstPragmaExp } = getFirstPragmaExp(inputFileContent)

  let outputFileContent = await replaceAllImportsRecursively(inputFileContent, dir)
  outputFileContent = removeDoubledSolidityVersion(outputFileContent)
  outputFileContent = removeDuplicatedExpHeaders(outputFileContent)
  firstPragmaExp = removeDoubledSolidityVersion(firstPragmaExp)
  outputFileContent = firstPragma + firstPragmaExp + outputFileContent
  if (!fs.existsSync(variables.outDir)) fs.mkdirSync(variables.outDir)
  const fileName = `${variables.flatContractPrefix}_flat.sol`
  const filePath = `${variables.outDir}/${fileName}`
  fs.writeFileSync(filePath, outputFileContent)
  log.info(`Success! Flat file ${fileName} is generated to  ${variables.outDir} directory`)
}
