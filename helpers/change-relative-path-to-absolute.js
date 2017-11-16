function changeRelativePathToAbsolute(fileContent, srcFile, importObjs) {	
	//replace relative paths to absolute path for imports
	for (var i = 0; i < importObjs.length; i++) {
		let isAbsolutePath = importObjs[i].dependencyPath.indexOf(".") != 0
		if (!isAbsolutePath) {
			let _fullImportStatement = importObjs[i].fullImportStatement
			let srcFileDir = srcFile.substring(0, srcFile.lastIndexOf("/"));
			_fullImportStatement = _fullImportStatement.replace(importObjs[i].dependencyPath, srcFileDir + "/" + importObjs[i].dependencyPath)
			fileContent = fileContent.replace(importObjs[i].fullImportStatement, _fullImportStatement)
		}
	}

	return fileContent;
}

module.exports = changeRelativePathToAbsolute;