const fs = require('fs')
const path = require('path')
const variables = require('./variables')
const findFile = require('./find-file')
const replaceRelativeImportPaths = require('./replace-relative-import-paths')
const updateImportObjectLocationInTarget = require('./update-import-object-location-in-target')
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute')
const findAllImportPaths = require('./find-all-import-paths')
const log = require('./logger')

function replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb) {
	if (i < importObjs.length) {
		let importObj = importObjs[i]
		importObj = updateImportObjectLocationInTarget(importObj, updatedFileContent)
		const { alias, contractName, startIndex, endIndex, dependencyPath } = importObj

		//replace contracts aliases
		if (contractName) {
			updatedFileContent = updatedFileContent.replace(alias + '.', contractName + '.')
		}
		
		let importStatement = updatedFileContent.substring(startIndex, endIndex)

		let fileExists
		let filePath
		let isRelativePath = dependencyPath.indexOf('.') == 0
		if (isRelativePath) {
			filePath = dir + dependencyPath
			fileExists = fs.existsSync(filePath, fs.F_OK)
		} else {
			filePath = dependencyPath
			fileExists = fs.existsSync(filePath, fs.F_OK)
		}
		if (fileExists) {
			log.info('###' + dependencyPath + ' SOURCE FILE FOUND###')
			let importedFileContent = fs.readFileSync(filePath, 'utf8')

			findAllImportPaths(dir, importedFileContent, (_importObjs) => {
				importedFileContent = changeRelativePathToAbsolute(importedFileContent, filePath, _importObjs)
				replaceRelativeImportPaths(importedFileContent, path.dirname(dependencyPath) + '/', (importedFileContentUpdated) => {
					if (!variables.importedSrcFiles.hasOwnProperty(path.basename(filePath))) {
						variables.importedSrcFiles[path.basename(filePath)] = importedFileContentUpdated
						if (importedFileContentUpdated.includes(' is ')) {
							updatedFileContent = updatedFileContent.replace(importStatement, importedFileContentUpdated)
						} else {
							updatedFileContent = updatedFileContent.replace(importStatement, '')
							updatedFileContent = importedFileContentUpdated + updatedFileContent
						}
					}
					else {
						updatedFileContent = updatedFileContent.replace(importStatement, '')
						//issue #1.
						if (updatedFileContent.includes(variables.importedSrcFiles[path.basename(filePath)])
							&& updatedFileContent.includes('import ')) {
							updatedFileContent = updatedFileContent.replace(variables.importedSrcFiles[path.basename(filePath)], '')
							updatedFileContent = importedFileContentUpdated + updatedFileContent
						}
					}

					i++
					replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb)
				})
			})
		} else {
			if (!variables.importedSrcFiles.hasOwnProperty(path.basename(filePath))) {
				log.info('!!!' + dependencyPath + ' SOURCE FILE NOT FOUND. TRY TO FIND IT RECURSIVELY!!!')
				
				let directorySeperator
				if (process.platform === 'win32') {
					directorySeperator = '\\'
				} else {
					directorySeperator = '/'
				}
				
				findFile.byNameAndReplace(dir.substring(0, dir.lastIndexOf(directorySeperator)), dependencyPath, updatedFileContent, importStatement, importObj, (_updatedFileContent) => {
					i++
					log.info('###' + dependencyPath + ' SOURCE FILE FOUND###')
					replaceAllImportsInCurrentLayer(i, importObjs, _updatedFileContent, dir, cb)
				})
			} else {
				updatedFileContent = updatedFileContent.replace(importStatement, '')
				i++
				replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir, cb)
			}
		}
	} else cb(updatedFileContent)
}

module.exports = replaceAllImportsInCurrentLayer
