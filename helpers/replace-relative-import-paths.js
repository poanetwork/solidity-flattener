const updateImportObjectLocationInTarget = require('./update-import-object-location-in-target')
const findAllImportPaths = require('./find-all-import-paths')

function replaceRelativeImportPaths(fileContent, curDir) {
	return new Promise(async (resolve) => {
		let updatedFileContent = fileContent
		const importObjs = await findAllImportPaths(curDir, fileContent)
		if (!importObjs || importObjs.length == 0) {
			resolve(updatedFileContent)
		}

		importObjs.forEach((importObj) => {
			importObj = updateImportObjectLocationInTarget(importObj, updatedFileContent)
			const { startIndex, endIndex, dependencyPath } = importObj
			const importStatement = updatedFileContent.substring(startIndex, endIndex)
			
			let newPath
			if (dependencyPath.indexOf('../') == 0
				|| dependencyPath.indexOf('./') == 0) {
				newPath = curDir + dependencyPath
			}
			else {
				newPath = dependencyPath
			}
			const importStatementNew = importStatement.replace(dependencyPath, newPath)
			updatedFileContent = updatedFileContent.replace(importStatement, importStatementNew)
		})
		resolve(updatedFileContent)
	})
}

module.exports = replaceRelativeImportPaths