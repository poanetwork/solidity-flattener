const fs = require('fs')
const path = require('path')
let decomment = require('decomment')
const findFile = require('./find-file')

function findAllImportPaths(dir, content, cb) {
	//strip comments from content
	content = decomment(content, {safe: true})
	const subStr = 'import '
	let allImports = []
	let regex = new RegExp(subStr,'gi')
	let importsCount = (content.match(regex) || []).length
	let importsIterator = 0
	let result
	while ( (result = regex.exec(content)) ) {
		let startImport = result.index
		let endImport = startImport + content.substr(startImport).indexOf(';') + 1
		let fullImportStatement = content.substring(startImport, endImport)
		let dependencyPath = fullImportStatement.split('"').length > 1 ? fullImportStatement.split('"')[1] : fullImportStatement.split('\'')[1]
		let alias = fullImportStatement.split(' as ').length > 1 ? fullImportStatement.split(' as ')[1].split(';')[0] : null

		let importObj = {
			startIndex: startImport, 
			endIndex: endImport, 
			dependencyPath, 
			fullImportStatement,
			alias,
			contractName: null
		}

		if (alias) {
			alias = alias.replace(/\s/g,'')
			let fileExists = fs.existsSync(dependencyPath, fs.F_OK)
			if (fileExists) {
				importsIterator++
				let fileContent = fs.readFileSync(dependencyPath, 'utf8')
				if (fileContent.includes('contract ')) {
					importObj.contractName = getContractName(fileContent)
				}
				allImports.push(importObj)
			} else {
				findFile.byName(dir.substring(0, dir.lastIndexOf('/')), path.basename(dependencyPath), (fileContent) => {
					importsIterator++
					if (fileContent.includes('contract ')) {
						importObj.contractName = getContractName(fileContent)
					}
					allImports.push(importObj)

					if (importsIterator == importsCount) cb(allImports)
				})
			}
		} else {
			importsIterator++
			allImports.push(importObj)
		}
	}
	if (importsIterator == importsCount) cb(allImports)
}

function getContractName(fileContent) {
	return fileContent.substring((fileContent.indexOf('contract ') + ('contract ').length), fileContent.indexOf('{')).replace(/\s/g,'')
}

module.exports = findAllImportPaths
