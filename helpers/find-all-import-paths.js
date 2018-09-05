const fs = require('fs')
const path = require('path')
let decomment = require('decomment')
const findFile = require('./find-file')
const constants = require('./constants')

/*
 * Finds all import paths
 */
function findAllImportPaths(dir, content) {
	return new Promise(async (resolve) => {
		//strip comments from content
		content = decomment(content, {safe: true})
		let allImports = []
		let regex = new RegExp(constants.IMPORT,'gi')
		let importsCount = (content.match(regex) || []).length
		let importsIterator = 0
		let result
		while ( (result = regex.exec(content)) ) {
			let startImport = result.index
			let endImport = startImport + content.substr(startImport).indexOf(constants.SEMICOLON) + 1
			let fullImportStatement = content.substring(startImport, endImport)
			let dependencyPath = fullImportStatement.split('"').length > 1 ? fullImportStatement.split('"')[1] : fullImportStatement.split('\'')[1]
			let alias = fullImportStatement.split(constants.AS).length > 1 ? fullImportStatement.split(constants.AS)[1].split(constants.SEMICOLON)[0] : null

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
				if (fileExists) {
					importsIterator++
					let fileContent = fs.readFileSync(dependencyPath, constants.UTF8)
					if (fileContent.includes(constants.CONTRACT)) {
						importObj.contractName = getContractName(fileContent)
					}
					allImports.push(importObj)
				} else {
					const fileName = dir.substring(0, dir.lastIndexOf(constants.SLASH))
					const fileContent = await findFile.byName(fileName, path.basename(dependencyPath))
					importsIterator++
					if (fileContent.includes(constants.CONTRACT)) {
						importObj.contractName = getContractName(fileContent)
					}
					allImports.push(importObj)

					if (importsIterator == importsCount) resolve(allImports)
				}
			} else {
				importsIterator++
				allImports.push(importObj)
			}
		}
		if (importsIterator == importsCount) resolve(allImports)
	})
}

function getContractName(fileContent) {
	return fileContent.substring((fileContent.indexOf(constants.CONTRACT) + constants.CONTRACT.length), fileContent.indexOf('{')).replace(/\s/g,constants.EMPTY)
}

module.exports = findAllImportPaths
