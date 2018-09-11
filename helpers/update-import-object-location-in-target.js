function updateImportObjectLocationInTarget(importObj, content) {
	if (content.includes(importObj.fullImportStatement)) {
		const startIndexNew = content.indexOf(importObj.fullImportStatement)
		const endIndexNew = startIndexNew - importObj.startIndex + importObj.endIndex
		importObj.startIndex = startIndexNew
		importObj.endIndex = endIndexNew
	} else {
		importObj.startIndex = 0
		importObj.endIndex = 0
	}
	return importObj
}

module.exports = updateImportObjectLocationInTarget