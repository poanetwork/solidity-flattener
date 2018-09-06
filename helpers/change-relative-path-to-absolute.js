const constants = require('./constants')
const cleanPath = require('./clean-path')

/*
 * Replaces relative paths to absolute path for imports
 */
async function changeRelativePathToAbsolute(dir, fileContent) {
	let fileContentNew = fileContent
	const findAllImportPaths = require('./find-all-import-paths')
	const importObjs = await findAllImportPaths(dir, fileContent)
	importObjs.forEach((importObj) => {
		let isAbsolutePath = !importObj.dependencyPath.startsWith(constants.DOT)
		if (!isAbsolutePath) {
			const { dependencyPath, fullImportStatement } = importObj
			let dependencyPathNew = dir + constants.SLASH + dependencyPath
			dependencyPathNew = cleanPath(dependencyPathNew)
			let fullImportStatementNew = fullImportStatement.split(dependencyPath).join(dependencyPathNew)
			fileContentNew = fileContentNew.split(fullImportStatement).join(fullImportStatementNew)
		}
	})

	return fileContentNew
}

module.exports = changeRelativePathToAbsolute