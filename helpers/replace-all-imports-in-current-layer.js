const fs = require('fs')
const path = require('path')
const variables = require('./variables')
const findFile = require('./find-file')
const replaceRelativeImportPaths = require('./replace-relative-import-paths')
const updateImportObjectLocationInTarget = require('./update-import-object-location-in-target')
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute')
const findAllImportPaths = require('./find-all-import-paths')
const log = require('./logger')

async function replaceAllImportsInCurrentLayer(i, importObjs, updatedFileContent, dir) {
	return new Promise(async (resolve) => {
		await replaceAllImportsInCurrentLayerInner(i, importObjs, updatedFileContent, dir, resolve)
	})
}

async function replaceAllImportsInCurrentLayerInner(i, importObjs, updatedFileContent, dir, resolve) {
	if (i >= importObjs.length) {
		return resolve(updatedFileContent)
	}

	let importObj = importObjs[i]
	importObj = updateImportObjectLocationInTarget(importObj, updatedFileContent)
	const { alias, contractName, startIndex, endIndex, dependencyPath } = importObj

	//replace contracts aliases
	if (contractName) {
		updatedFileContent = updatedFileContent.replace(alias + '.', contractName + '.')
	}
	
	let importStatement = updatedFileContent.substring(startIndex, endIndex)

	let fileExists, filePath
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
		const _importObjs = await findAllImportPaths(dir, importedFileContent)
		importedFileContent = changeRelativePathToAbsolute(importedFileContent, filePath, _importObjs)
		const importedFileContentUpdated = await replaceRelativeImportPaths(importedFileContent, path.dirname(dependencyPath) + '/')
		if (!variables.importedSrcFiles.hasOwnProperty(path.basename(filePath))) {
			variables.importedSrcFiles[path.basename(filePath)] = importedFileContentUpdated
			if (importedFileContentUpdated.includes(' is ')) {
				updatedFileContent = updatedFileContent.replace(importStatement, importedFileContentUpdated)
			} else {
				updatedFileContent = updatedFileContent.replace(importStatement, '')
				updatedFileContent = importedFileContentUpdated + updatedFileContent
			}
		} else {
			updatedFileContent = updatedFileContent.replace(importStatement, '')
			//issue #1.
			if (updatedFileContent.includes(variables.importedSrcFiles[path.basename(filePath)])
				&& updatedFileContent.includes('import ')) {
				updatedFileContent = updatedFileContent.replace(variables.importedSrcFiles[path.basename(filePath)], '')
				updatedFileContent = importedFileContentUpdated + updatedFileContent
			}
		}

		i++
		replaceAllImportsInCurrentLayerInner(i, importObjs, updatedFileContent, dir, resolve)
	} else {
		if (!variables.importedSrcFiles.hasOwnProperty(path.basename(filePath))) {
			log.info('!!!' + dependencyPath + ' SOURCE FILE NOT FOUND. TRY TO FIND IT RECURSIVELY!!!')
			
			let directorySeperator
			if (process.platform === 'win32') {
				directorySeperator = '\\'
			} else {
				directorySeperator = '/'
			}

			const dirNew = dir.substring(0, dir.lastIndexOf(directorySeperator))
			const _updatedFileContent = await findFile.byNameAndReplace(dirNew, dependencyPath, updatedFileContent, importStatement, importObj)
			i++
			log.info('###' + dependencyPath + ' SOURCE FILE FOUND###')
			replaceAllImportsInCurrentLayerInner(i, importObjs, _updatedFileContent, dir, resolve)
		} else {
			updatedFileContent = updatedFileContent.replace(importStatement, '')
			i++
			replaceAllImportsInCurrentLayerInner(i, importObjs, updatedFileContent, dir, resolve)
		}
	}		
}

module.exports = replaceAllImportsInCurrentLayer
