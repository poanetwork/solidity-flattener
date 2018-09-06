const assert = require('assert')
const cleanPath = require('../../helpers/clean-path.js')

const path = './././././ta/fgfd/./gfd/gfd/./g/dfg/dfgdf/./gd/fg/././df/gdf/g/js'
const expectedCleanedPath = './ta/fgfd/gfd/gfd/g/dfg/dfgdf/gd/fg/df/gdf/g/js'

const path2 = '../gfdgfdgfd/../gdfgdfgdfgdfgd'
const expectedCleanedPath2 = '../gdfgdfgdfgdfgd'

const path3 = './abc/def/gedfg/test.js'

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