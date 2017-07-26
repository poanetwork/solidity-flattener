pragma solidity ^0.4.11;

contract ValidatorClass {
    address[] public validators;
    address[] public disabledValidators;
    
    struct Validator {
        string fullName;
        string streetName;
        string state;
        uint zip;
        uint licenseID;
        uint licenseExpiredAt;
        uint disablingDate;
        string disablingTX;
    }
    
    mapping(address => Validator) public validator;
}