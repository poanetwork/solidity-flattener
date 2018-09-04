#! /usr/bin/env node
const fs = require('fs')
const glob = require('glob-promise')
const variables = require('./helpers/variables')
const log = require('./helpers/logger')
const removeDoubledSolidityVersion = require('./helpers/remove-doubled-solidity-version')
const replaceAllImportsRecursively = require('./helpers/replace-all-imports-recursively')

flatten()

async function flatten() {
	const inputFileContent = await fs.readFileSync(variables.inputFilePath, 'utf8')
	const dir = variables.parentDir + '/'
	const path = variables.parentDir + '/**/*.sol'
	const srcFiles = await getSourceFiles(dir, path)
	variables.srcFiles = srcFiles
	await replaceImports(inputFileContent, dir)
}

async function getSourceFiles(dir, path) {
	return await glob(path)
}

async function replaceImports(inputFileContent, dir) {
	let outputFileContent = await replaceAllImportsRecursively(inputFileContent, dir)
	outputFileContent = removeDoubledSolidityVersion(outputFileContent)
	if (!fs.existsSync(variables.outDir)) fs.mkdirSync(variables.outDir)
	fs.writeFileSync(variables.outDir + '/' + variables.flatContractPrefix + '_flat.sol', outputFileContent)
	log.info('Success! Flat file is generated to ' + variables.outDir + ' directory')
}
