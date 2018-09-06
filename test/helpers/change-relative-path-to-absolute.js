const fs = require('fs')
const assert = require('assert')
const constants = require('../../helpers/constants')
const changeRelativePathToAbsolute = require('../../helpers/change-relative-path-to-absolute.js')

const dir = './test/contracts'
const filePath = dir + '/test.sol'
const editedFilePath = dir + '/testMock1.sol'
const fileContent = fs.readFileSync(filePath, constants.UTF8)
const expectedFileContentNew = fs.readFileSync(editedFilePath, constants.UTF8)

describe('changeRelativePathToAbsolute', () => {
	it('should change relative path to absolute for imports', async () => {
		const fileContentNew = await changeRelativePathToAbsolute(dir, fileContent)
		assert.equal(fileContentNew, expectedFileContentNew)
	})
})