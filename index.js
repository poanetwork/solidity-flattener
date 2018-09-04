#! /usr/bin/env node
const fs = require('fs')
const glob = require('glob')
const variables = require('./helpers/variables')
const log = require('./helpers/logger')
const removeDoubledSolidityVersion = require('./helpers/remove-doubled-solidity-version')
const replaceAllImportsRecursively = require('./helpers/replace-all-imports-recursively')

fs.readFile(variables.inputFilePath, 'utf8', readInputFileCallBack)

function readInputFileCallBack(err, inputFileContent) {
	if (err) return log.error(err.message)

	generateFlatFile(variables.parentDir + '/', variables.parentDir + '/**/*.sol', inputFileContent)
}

function generateFlatFile(dir, path, inputFileContent) {
	glob(path, function(err, srcFiles) {
		variables.allSrcFiles = srcFiles
		if (err) return log.error(err.message)
		getAllSolFilesCallBack(inputFileContent, dir)
	})
}

function getAllSolFilesCallBack(inputFileContent, dir) {
	replaceAllImportsRecursively(inputFileContent, dir, function(outputFileContent) {
		outputFileContent = removeDoubledSolidityVersion(outputFileContent)
		if (!fs.existsSync(variables.outDir)) fs.mkdirSync(variables.outDir)
		fs.writeFileSync(variables.outDir + '/' + variables.flatContractPrefix + '_flat.sol', outputFileContent)
		log.info('Success! Flat file is generated to ' + variables.outDir + ' directory')
	})
}
