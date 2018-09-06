const fs = require('fs')
const glob = require('glob-promise')
const path = require('path')
const variables = require('./variables')
const constants = require('./constants')
const changeRelativePathToAbsolute = require('./change-relative-path-to-absolute')

function byName(dir, fileName) {
	return new Promise((resolve) => {
		return byNameInner(dir, fileName, resolve)
	})
}

async function byNameInner(dir, fileName, resolve) {
	const srcFiles = await glob(dir + constants.SOL)
	for (let j = 0; j < srcFiles.length; j++) {
		if (path.basename(srcFiles[j]) == fileName) {
			let fileContent = fs.readFileSync(srcFiles[j], constants.UTF8)
			resolve(fileContent)
			break
		}
	}

	dir = dir.substring(0, dir.lastIndexOf(constants.SLASH))
	byNameInner(dir, fileName, resolve)
}

async function byNameAndReplace(dir, dependencyPath, updatedFileContent, importStatement) {
	return new Promise((resolve, reject) => {
		return byNameAndReplaceInner(dir, dependencyPath, updatedFileContent, importStatement, resolve, reject)
	})
}

async function byNameAndReplaceInner(dir, dependencyPath, updatedFileContent, importStatement, resolve, reject) {
	const srcFiles = await glob(dir + constants.SOL)
	let result = await byNameAndReplaceInnerRecursively(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, 0)
	let { flattenFileContent, importIsReplacedBefore } = result
	if (importIsReplacedBefore) {
		flattenFileContent = flattenFileContent.replace(importStatement, constants.EMPTY)
		return resolve(flattenFileContent)
	} else {
		if (dir.includes(constants.SLASH)) {
			dir = dir.substring(0, dir.lastIndexOf(constants.SLASH))
			byNameAndReplaceInner(dir, dependencyPath, flattenFileContent, importStatement, resolve, reject)
		} else {
			flattenFileContent = flattenFileContent.replace(importStatement, constants.EMPTY)
			return resolve(flattenFileContent)
		}
	}
}

async function byNameAndReplaceInnerRecursively(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j) {
	return new Promise((resolve, reject) => {
		byNameAndReplaceInnerRecursivelyInner(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j, resolve, reject)
	})
}

async function byNameAndReplaceInnerRecursivelyInner(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j, resolve, reject, importIsReplacedBefore) {
	if (j >= srcFiles.length) return resolve({ flattenFileContent: updatedFileContent, importIsReplacedBefore })

	let isAbsolutePath = !dependencyPath.startsWith(constants.DOT)
	const filePath = srcFiles[j]
	const { importedSrcFiles } = variables
	if (isAbsolutePath && filePath.includes(dependencyPath)) {
		let flattenFileContent = constants.EMPTY
		if (!importedSrcFiles.hasOwnProperty(path.basename(filePath)) || fs.existsSync(dependencyPath)) {
			let importFileContent
			if (fs.existsSync(dependencyPath)) {
				importFileContent = await changeRelativePathToAbsolute(dependencyPath)
			} else {
				importFileContent = await changeRelativePathToAbsolute(filePath)
			}

			if (importFileContent.includes(constants.IS)) {
				flattenFileContent = updatedFileContent.replace(importStatement, importFileContent)
			} else {
				flattenFileContent = importFileContent + updatedFileContent.replace(importStatement, constants.EMPTY)
			}
			importedSrcFiles[path.basename(filePath)] = importFileContent
			resolve({ flattenFileContent, importIsReplacedBefore: true })
		} else {
			flattenFileContent = updatedFileContent.replace(importStatement, constants.EMPTY)
			//issue #2.
			const fileName = importedSrcFiles[path.basename(dir + dependencyPath)]
			if (flattenFileContent.includes(fileName) && flattenFileContent.includes(constants.IMPORT)) {
				let importFileContent = fs.readFileSync(filePath, constants.UTF8)
				flattenFileContent = importFileContent + flattenFileContent.replace(fileName, constants.EMPTY)
			}
			importIsReplacedBefore = true
			j++
			byNameAndReplaceInnerRecursivelyInner(importStatement, flattenFileContent, dir, dependencyPath, srcFiles, j, resolve, reject, importIsReplacedBefore)
		}
	} else {
		j++
		byNameAndReplaceInnerRecursivelyInner(importStatement, updatedFileContent, dir, dependencyPath, srcFiles, j, resolve, reject, importIsReplacedBefore)
	}
}

module.exports = {
	byName,
	byNameAndReplace
}