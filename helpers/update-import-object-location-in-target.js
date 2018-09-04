function updateImportObjectLocationInTarget(importObj, content) {
	const startIndexNew = content.indexOf(importObj.fullImportStatement)
	const endIndexNew = startIndexNew - importObj.startIndex + importObj.endIndex
	importObj.startIndex = startIndexNew
	importObj.endIndex = endIndexNew
	return importObj
}

module.exports = updateImportObjectLocationInTarget