const assert = require('assert')
const cleanPath = require('../../helpers/clean-path.js')

const path = './././abc/./def/./././ghi/./jk/test.js'
const expectedCleanedPath = './abc/def/ghi/jk/test.js'

const path2 = '../abc/../def'
const expectedCleanedPath2 = '../def'

const path3 = './abc/def/ghijk/test.js'

describe('cleanPath', () => {
	it('should clean path to file from all occurrences of /./', async () => {
		assert.equal(cleanPath(path), expectedCleanedPath)
	})

	it('should not  clean relative path f/../', async () => {
		assert.equal(cleanPath(path2), expectedCleanedPath2)
	})

	it('should not clean already cleaned path', async () => {
		assert.equal(cleanPath(path3), path3)
	})

	it('should handle a empty string', async () => {
		assert.equal(cleanPath(''), '')
	})
})