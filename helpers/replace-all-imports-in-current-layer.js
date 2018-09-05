const fs = require('fs')
const path = require('path')
const variables = require('./variables')
const constants = require('./constants')
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

	console.log(`dependencyPath before: ${dependencyPath}`)
	dependencyPath = cleanPath(dependencyPath)
	console.log(`dependencyPath after: ${dependencyPath}`)
	let isRelativePath = dependencyPath.startsWith(constants.DOT)
	let filePath = isRelativePath ? dir + dependencyPath : dependencyPath
	console.log(`filePath before: ${filePath}`)
	filePath = cleanPath(filePath)
	console.log(`filePath after: ${filePath}`)

	const importStatement = updatedFileContent.substring(startIndex, endIndex)
	const fileBaseName = path.basename(filePath)
	const fileExists = fs.existsSync(filePath, fs.F_OK)
	if (fileExists) {
		log.info(`### ${dependencyPath} SOURCE FILE WAS FOUND###`)
		let importedFileContent = fs.readFileSync(filePath, constants.UTF8)
		const _importObjs = await findAllImportPaths(dir, importedFileContent)
		importedFileContent = changeRelativePathToAbsolute(importedFileContent, filePath, _importObjs)
		const importedFileContentUpdated = await replaceRelativeImportPaths(importedFileContent, path.dirname(dependencyPath) + constants.SLASH)
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
			log.info(`!!! ${dependencyPath} SOURCE FILE WAS NOT FOUND. TRY TO FIND IT RECURSIVELY!!!`)
			const directorySeperator = process.platform === 'win32' ? '\\' : constants.SLASH
			const dirNew = dir.substring(0, dir.lastIndexOf(directorySeperator))
			_updatedFileContent = await findFile.byNameAndReplace(dirNew, dependencyPath, _updatedFileContent, importStatement)
			log.info(`### ${dependencyPath} SOURCE FILE WAS FOUND###`)
		} else {
			_updatedFileContent = _updatedFileContent.replace(importStatement, constants.EMPTY)
		}
	}

	i++
	replaceAllImportsInCurrentLayerInner(i, importObjs, _updatedFileContent, dir, resolve)
}


function cleanPath(path) {
	let cleanedPath
	if (path.includes(constants.DIRTY_PATH)) {
		const re = new RegExp(constants.DIRTY_PATH, 'g')
		cleanedPath = path.replace(re, constants.SLASH)
	} else {
		cleanedPath = path
	}

	if (cleanedPath.includes(constants.DIRTY_PATH)) {
		return cleanPath(cleanedPath)
	} else {
		return cleanedPath
	}
}

module.exports = replaceAllImportsInCurrentLayer
