const { SEMICOLON, EMPTY } = require('./constants')
const pragmaExperimentalstr = 'pragma experimental'

/*
 * Removes all pragma solidity instruction
 */
function removeDuplicatedExpHeaders(content) {
    //1st pragma solidity declaration
    const { firstIndex, lastIndex } = getFirstPragmaExp(content)
    if (firstIndex >= 0 && lastIndex > 0) {
        const contentPart = content.substr(lastIndex)
        let contentFiltered = contentPart
        //remove other pragma solidity declarations
        const regex = new RegExp(pragmaExperimentalstr,'gi')
        let result
        while ( (result = regex.exec(contentPart)) ) {
            const start = result.index
            const end = start + contentPart.substr(start).indexOf(SEMICOLON) + 1
            if (start != firstIndex) contentFiltered = contentFiltered.replace(contentPart.substring(start, end), EMPTY)
        }
        return contentFiltered
    } else {
        return content
    }
}

/*
 * Gets 1st pragma solidity instruction from content
 */
function getFirstPragmaExp(content) {
    const firstIndex = content.indexOf(pragmaExperimentalstr)
    const lastIndex = firstIndex + content.substr(firstIndex).indexOf(SEMICOLON) + 1
    const pragmaExp = content.substr(0, lastIndex)
    return { pragmaExp, firstIndex, lastIndex}
}

module.exports = {
    removeDuplicatedExpHeaders,
    getFirstPragmaExp,
}
