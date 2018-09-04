const fs = require('fs')
const glob = require('glob-promise')
const path = require('path')
const variables = require('./variables')
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute')
const log = require('./logger')

function byName(dir, fileName, cb) {
	glob(dir + '/**/*.sol')
		.then((srcFiles) => {
			for (let j = 0; j < srcFiles.length; j++) {
				if (path.basename(srcFiles[j]) == fileName) {
					let fileContent = fs.readFileSync(srcFiles[j], 'utf8')
					cb(fileContent)
					return
				}
			}

			dir = dir.substring(0, dir.lastIndexOf('/'))
			byName(dir, fileName, cb)
		})
		.catch(err => {
			log.error(err.message)
		})
}

async function byNameAndReplace(dir, filePath, updatedFileContent, importStatement, importObj) {
	return new Promise((resolve, reject) => {
		return byNameAndReplaceInner(dir, filePath, updatedFileContent, importStatement, importObj, resolve, reject)
	})
}

async function byNameAndReplaceInner(dir, filePath, updatedFileContent, importStatement, importObj, resolve, reject) {
	const srcFiles = await glob(dir + '/**/*.sol')
	let _importIsReplacedBefore = false
	let result = await byNameAndReplaceInnerRecursively(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, 0, _importIsReplacedBefore)
	let { flattenFileContent, importIsReplacedBefore } = result
	if (importIsReplacedBefore) {
		flattenFileContent = flattenFileContent.replace(importStatement, '')
		return resolve(flattenFileContent)
	} else {
		if (dir.includes('/')) {
			dir = dir.substring(0, dir.lastIndexOf('/'))
			byNameAndReplaceInner(dir, filePath, flattenFileContent, importStatement, importObj, resolve, reject)
		} else {
			flattenFileContent = flattenFileContent.replace(importStatement, '')
			return resolve(flattenFileContent)
		}
	}
}

async function byNameAndReplaceInnerRecursively(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, j, importIsReplacedBefore) {
	return new Promise((resolve, reject) => {
		byNameAndReplaceInnerRecursivelyInner(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, j, resolve, reject, importIsReplacedBefore)
	})
}

async function byNameAndReplaceInnerRecursivelyInner(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, j, resolve, reject, importIsReplacedBefore) {
	if (j >= srcFiles.length) return resolve({ flattenFileContent: updatedFileContent, importIsReplacedBefore })
	const findAllImportPaths = require('./find-all-import-paths.js')
	let isAbsolutePath = filePath.indexOf('.') != 0
	const srcFile = srcFiles[j]
	let flattenFileContent = ''
	if (isAbsolutePath && srcFile.includes(filePath)) {
		if (!variables.importedSrcFiles.hasOwnProperty(path.basename(srcFile)) || fs.existsSync(filePath)) {
			let importFileContent 
			if (fs.existsSync(filePath)) {
				importFileContent = fs.readFileSync(filePath, 'utf8')
			} else {
				importFileContent = fs.readFileSync(srcFile, 'utf8')
			}
			const importObjs = await findAllImportPaths(dir, importFileContent)
			importFileContent = changeRelativePathToAbsolute(importFileContent, srcFile, importObjs)

			if (importFileContent.includes(' is ')) {
				flattenFileContent = updatedFileContent.replace(importStatement, importFileContent)
			} else {
				flattenFileContent = importFileContent + updatedFileContent.replace(importStatement, '')
			}
			variables.importedSrcFiles[path.basename(srcFile)] = importFileContent
			return resolve({ flattenFileContent, importIsReplacedBefore: true })
		} else {
			flattenFileContent = updatedFileContent.replace(importStatement, '')
			//issue #2.
			const fileName = variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)]
			if (flattenFileContent.includes(fileName)
				&& flattenFileContent.includes('import ')) {
				let importFileContent = fs.readFileSync(srcFile, 'utf8')
				flattenFileContent = importFileContent + flattenFileContent.replace(fileName, '')
			}
			importIsReplacedBefore = true
			j++
			byNameAndReplaceInnerRecursivelyInner(importStatement, importObj, flattenFileContent, dir, filePath, srcFiles, j, resolve, reject, importIsReplacedBefore)
		}
	} else {
		j++
		byNameAndReplaceInnerRecursivelyInner(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, j, resolve, reject, importIsReplacedBefore)
	}
}

module.exports = {
	byName,
	byNameAndReplace
}