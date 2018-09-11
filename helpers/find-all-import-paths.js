const fs = require('fs')
const path = require('path')
const decomment = require('decomment')
const findFile = require('./find-file')
const constants = require('./constants')

/*
 * Finds all import paths
 */
function findAllImportPaths(dir, content) {
	return new Promise(async (resolve) => {
		content = decomment(content, {safe: true})
		let allImports = []
		const regex = new RegExp(constants.IMPORT,'gi')
		const importsCount = (content.match(regex) || []).length
		let importsIterator = 0
		let result
		while ( (result = regex.exec(content)) ) {
			const startImport = result.index
			const endImport = startImport + content.substr(startImport).indexOf(constants.SEMICOLON) + 1
			const fullImportStatement = content.substring(startImport, endImport)
			const fullImportParts = fullImportStatement.split('"')
			const fullImportPartsAlt = fullImportStatement.split('\'')
			const dependencyPath = fullImportParts.length > 1 ? fullImportParts[1] : fullImportPartsAlt[1]
			const fullImportPartsByAs = fullImportStatement.split(constants.AS)
			let alias = fullImportPartsByAs.length > 1 ? fullImportPartsByAs[1].split(constants.SEMICOLON)[0] : null

			let importObj = {
				startIndex: startImport,
				endIndex: endImport,
				dependencyPath,
				fullImportStatement,
				alias,
			}

			if (alias) {
				alias = alias.replace(/\s/g,constants.EMPTY)
				let fileExists = fs.existsSync(dependencyPath, fs.F_OK)
				let fileContent
				if (fileExists) {
					fileContent = fs.readFileSync(dependencyPath, constants.UTF8)
				} else {
					dir = dir.substring(0, dir.lastIndexOf(constants.SLASH))
					fileContent = await findFile.byName(dir, path.basename(dependencyPath))
				}
				if (fileContent.includes(constants.CONTRACT)) {
					importObj.contractName = getContractName(fileContent)
				}
			}

			importsIterator++
			allImports.push(importObj)
		}
		if (importsIterator == importsCount) resolve(allImports)
	})
}

function getContractName(fileContent) {
	return fileContent.substring((fileContent.indexOf(constants.CONTRACT) + constants.CONTRACT.length), fileContent.indexOf('{')).replace(/\s/g,constants.EMPTY)
}

module.exports = findAllImportPaths
