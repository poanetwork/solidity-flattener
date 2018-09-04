function changeRelativePathToAbsolute(fileContent, srcFile, importObjs) {	
	//replace relative paths to absolute path for imports
	importObjs.forEach((importObj) => {
		let isAbsolutePath = importObj.dependencyPath.indexOf('.') != 0
		if (!isAbsolutePath) {
			let _fullImportStatement = importObj.fullImportStatement
			let srcFileDir = srcFile.substring(0, srcFile.lastIndexOf('/'))
			const { dependencyPath } = importObj
			_fullImportStatement = _fullImportStatement.replace(dependencyPath, srcFileDir + '/' + dependencyPath)
			fileContent = fileContent.replace(importObj.fullImportStatement, _fullImportStatement)
		}
	})

	return fileContent
}

module.exports = changeRelativePathToAbsolute