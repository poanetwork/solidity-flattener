## Solidity flat file generation

##### Combines all local imports to one .sol file



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
Success! Flat file is generated to ./out directory
```

`./flatContract.sol` - flat .sol file is created in output directory (`./out/` by default)

**Note:** *utility won't work with aliases at import statements*

## Config

path `./config.json`

```
{
	"inputFilePath": "./demo/src/Oracles.sol",
	"outputDir": "./out"
}
```

