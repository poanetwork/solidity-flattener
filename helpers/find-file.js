const fs = require('fs')
const glob = require('glob')
const path = require('path')
const variables = require('./variables')
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute')
const log = require('./logger')

function byName(dir, fileName, cb) {
	glob(dir + '/**/*.sol', (err, srcFiles) => {
		if (err) return log.error(err.message)

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
}

function byNameAndReplace(dir, filePath, updatedFileContent, importStatement, importObj, cb) {
	glob(dir + '/**/*.sol', (err, srcFiles) => {
		if (err) return log.error(err.message)
		
		let importIsReplacedBefore = false
		byNameAndReplaceInner(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, 0, cb, () => {
			if (importIsReplacedBefore) {
				updatedFileContent = updatedFileContent.replace(importStatement, '')
				cb(updatedFileContent)
			} else {
				if (dir.includes('/')) {
					dir = dir.substring(0, dir.lastIndexOf('/'))
					byNameAndReplace(dir, filePath, updatedFileContent, importStatement, importObj, cb)
				} else {
					updatedFileContent = updatedFileContent.replace(importStatement, '')
					cb(updatedFileContent)
				}
			}
		})
	})
}

function byNameAndReplaceInner(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, j, cb, cbInner) {
	if (j >= srcFiles.length) return cbInner()
	const findAllImportPaths = require('./find-all-import-paths.js')
	let isAbsolutePath = filePath.indexOf('.') != 0
	if (isAbsolutePath && srcFiles[j].includes(filePath)) {

		if (!variables.importedSrcFiles.hasOwnProperty(path.basename(srcFiles[j]))
			|| fs.existsSync(filePath)) {
			let fileContent 
			if (fs.existsSync(filePath)) fileContent = fs.readFileSync(filePath, 'utf8')
			else fileContent = fs.readFileSync(srcFiles[j], 'utf8')

			findAllImportPaths(dir, fileContent, (_importObjs) => {
				fileContent = changeRelativePathToAbsolute(fileContent, srcFiles[j], _importObjs)

				if (fileContent.includes(' is ')) {
					updatedFileContent = updatedFileContent.replace(importStatement, fileContent)
				} else {
					//updatedFileContent = updatedFileContent.replace(importStatement, fileContent);
					updatedFileContent = updatedFileContent.replace(importStatement, '')
					updatedFileContent = fileContent + updatedFileContent
				}
				variables.importedSrcFiles[path.basename(srcFiles[j])] = fileContent
				return cb(updatedFileContent)
			})
		} else {
			updatedFileContent = updatedFileContent.replace(importStatement, '')
			//issue #2.
			if (updatedFileContent.includes(variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)])
				&& updatedFileContent.includes('import ')) {
				let fileContent = fs.readFileSync(srcFiles[j], 'utf8')
				updatedFileContent = updatedFileContent.replace(variables.importedSrcFiles[path.basename(dir + importObj.dependencyPath)], '')
				updatedFileContent = fileContent + updatedFileContent
			}
			j++
			byNameAndReplaceInner(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, j, cb, cbInner)
		}
	} else {
		j++
		byNameAndReplaceInner(importStatement, importObj, updatedFileContent, dir, filePath, srcFiles, j, cb, cbInner)
	}
}

module.exports = {
	byName,
	byNameAndReplace
}