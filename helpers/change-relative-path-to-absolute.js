/*
 * Replaces relative paths to absolute path for imports
 */
function changeRelativePathToAbsolute(fileContent, srcFile, importObjs) {
	let fileContentNew = fileContent
	importObjs.forEach((importObj) => {
		let isAbsolutePath = importObj.dependencyPath.indexOf('.') != 0
		if (!isAbsolutePath) {
			const { dependencyPath, fullImportStatement } = importObj
			const srcFileDir = srcFile.substring(0, srcFile.lastIndexOf('/'))
			const dependencyPathNew = srcFileDir + '/' + dependencyPath
			let fullImportStatementNew = fullImportStatement.split(dependencyPath).join(dependencyPathNew)
			fileContentNew = fileContentNew.split(fullImportStatement).join(fullImportStatementNew)
		}
	})

	return fileContentNew
}

module.exports = changeRelativePathToAbsolute