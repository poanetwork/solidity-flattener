const fs = require('fs')
const path = require('path')
const variables = require('./variables')
const constants = require('./constants')
const findFile = require('./find-file')
const updateImportObjectLocationInTarget = require('./update-import-object-location-in-target')
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute')
const cleanPath = require('./clean-path')
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

	// console.log(importObjs)
	// console.log(dir)
	let importObj = importObjs[i]
	importObj = updateImportObjectLocationInTarget(importObj, updatedFileContent)
	const { alias, contractName, startIndex, endIndex } = importObj
	let { dependencyPath } = importObj
	const { importedSrcFiles } = variables
	let _updatedFileContent

	//replace contracts aliases
	if (contractName) {
		_updatedFileContent = updatedFileContent.replace(alias + constants.DOT, contractName + constants.DOT)
	} else {
		_updatedFileContent = updatedFileContent
	}

	dependencyPath = cleanPath(dependencyPath)
	let isAbsolutePath = !dependencyPath.startsWith(constants.DOT)
	let filePath = isAbsolutePath ? dependencyPath : (dir + dependencyPath)
	filePath = cleanPath(filePath)

	const importStatement = updatedFileContent.substring(startIndex, endIndex)
	const fileBaseName = path.basename(filePath)
	const fileExists = fs.existsSync(filePath, fs.F_OK)
	if (fileExists) {
		log.info(`${filePath} SOURCE FILE WAS FOUND`)
		const importedFileContentUpdated = await changeRelativePathToAbsolute(filePath)
		//const importedFileContentUpdated = await replaceRelativeImportPaths(path.dirname(dependencyPath) + constants.SLASH, importedFileContent)
		if (!importedSrcFiles.hasOwnProperty(fileBaseName)) {
			importedSrcFiles[fileBaseName] = importedFileContentUpdated
			if (importedFileContentUpdated.includes(constants.IS)) {
				_updatedFileContent = _updatedFileContent.replace(importStatement, importedFileContentUpdated)
			} else {
				_updatedFileContent = importedFileContentUpdated + _updatedFileContent.replace(importStatement, constants.EMPTY)
			}
		} else {
			_updatedFileContent = _updatedFileContent.replace(importStatement, constants.EMPTY)
			//issue #1.
			if (_updatedFileContent.includes(importedSrcFiles[fileBaseName]) && _updatedFileContent.includes(constants.IMPORT)) {
				_updatedFileContent = importedFileContentUpdated + _updatedFileContent.replace(importedSrcFiles[fileBaseName], constants.EMPTY)
			}
		}
	} else {
		if (!importedSrcFiles.hasOwnProperty(fileBaseName)) {
			log.warn(`!!! ${filePath} SOURCE FILE WAS NOT FOUND. I'M TRYING TO FIND IT RECURSIVELY !!!`)
			const directorySeperator = process.platform === 'win32' ? '\\' : constants.SLASH
			const dirNew = dir.substring(0, dir.lastIndexOf(directorySeperator))
			_updatedFileContent = await findFile.byNameAndReplace(dirNew, dependencyPath, _updatedFileContent, importStatement)
			log.info(`${filePath} SOURCE FILE WAS FOUND`)
		} else {
			_updatedFileContent = _updatedFileContent.replace(importStatement, constants.EMPTY)
		}
	}

	i++
	replaceAllImportsInCurrentLayerInner(i, importObjs, _updatedFileContent, dir, resolve)
}

module.exports = replaceAllImportsInCurrentLayer
