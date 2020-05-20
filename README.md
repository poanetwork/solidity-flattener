# Solidity smart-contract flattened source file generation

[![Build Status](https://travis-ci.org/poanetwork/solidity-flattener.svg?branch=master)](https://travis-ci.org/poanetwork/solidity-flattener)
[![Known Vulnerabilities](https://snyk.io/test/github/poanetwork/solidity-flattener/badge.svg)](https://snyk.io/test/github/poanetwork/solidity-flattener)
[![Coverage Status](https://coveralls.io/repos/github/poanetwork/solidity-flattener/badge.svg?branch=master)](https://coveralls.io/github/poanetwork/solidity-flattener?branch=master)

## Utility to combine all imports to one flatten .sol file

### Installation from npm

`npm i @poanet/solidity-flattener`

### Usage

`./node_modules/.bin/poa-solidity-flattener ./contracts/example.sol`

It will save flattened source of Solidity smart-contract into `./out` directory

### Installation from source


```
git clone https://github.com/poanetwork/solidity-flattener
cd solidity-flattener
npm install
```

You can start script either

```
npm start "path_to_not_flat_contract_definition_file.sol"
```

or without paramaters (path to input file will be extracted from `./config.json`)

```
npm start
```



Expected result: 

```
Success! Flat file ORIGINAL_FILE_NAME_flat.sol is generated to ./out directory
```

`./flatContract.sol` - flat .sol file is created in output directory (`./out/` by default)

**Note:** *utility doesn't support aliases at import statements*

## Config

path `./config.json`

```
{
	"inputFilePath": "./demo/src/Oracles.sol",
	"outputDir": "./out"
}
```

