const findAllImportPaths = require('./find-all-import-paths')
const replaceAllImportsInCurrentLayer = require('./replace-all-imports-in-current-layer')

/*
 * Recursively replaces all imports
 */
async function replaceAllImportsRecursively(fileContent, dir) {
	return new Promise(async (resolve) => {
		await replaceAllImportsRecursivelyInner(fileContent, dir, resolve)
	})
}

async function replaceAllImportsRecursivelyInner(fileContent, dir, resolve) {
	const importObjs = await findAllImportPaths(dir, fileContent)
	if (!importObjs || importObjs.length == 0) {
		return resolve(fileContent)
	}

	const updatedFileContent = await replaceAllImportsInCurrentLayer(0, importObjs, fileContent, dir)
	replaceAllImportsRecursivelyInner(updatedFileContent, dir, resolve)
}

module.exports = replaceAllImportsRecursively
