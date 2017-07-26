pragma solidity ^0.4.11;

import "./ValidatorsManager.sol";

contract BallotsManager is ValidatorsManager {
    /**
    @notice Adds new Ballot
    @param ballotID Ballot unique ID
    @param owner Voting key of notary, who creates ballot
    @param miningKey Mining key of notary, which is proposed to add or remove
    @param affectedKey Mining/payout/voting key of notary, which is proposed to add or remove
    @param affectedKeyType Type of affectedKey: 0 = mining key, 1 = voting key, 2 = payout key
    @param addAction Flag: adding is true, removing is false
    @param memo Ballot's memo
    */
    function addBallot(
        uint ballotID,
        address owner,
        address miningKey,
        address affectedKey,
        uint affectedKeyType,
        bool addAction,
        string memo
    ) {
        if (!checkVotingKeyValidity(msg.sender)) throw;
        if (licensesIssued == licensesLimit && addAction) throw;
        if (ballotsMapping[ballotID].createdAt > 0) throw;
        if (affectedKeyType == 0) {//mining key
            bool validatorIsAdded = false;
            for (uint i = 0; i < validators.length; i++) {
                if (validators[i] == affectedKey && addAction) throw; //validator is already added before
                if (validators[i] == affectedKey) {
                    validatorIsAdded = true;
                    break;
                }
            }
            for (uint j = 0; j < disabledValidators.length; j++) {
                if (disabledValidators[j] == affectedKey) throw; //validator is already removed before
            }
            if (!validatorIsAdded && !addAction) throw; // no such validator in validators array to remove it
        } else if (affectedKeyType == 1) {//voting key
            if (checkVotingKeyValidity(affectedKey) && addAction) throw; //voting key is already added before
            if (!checkVotingKeyValidity(affectedKey) && !addAction) throw; //no such voting key to remove it
        } else if (affectedKeyType == 2) {//payout key
            if (checkPayoutKeyValidity(affectedKey) && addAction) throw; //payout key is already added before
            if (!checkPayoutKeyValidity(affectedKey) && !addAction) throw; //no such payout key to remove it
        }
        uint votingStart = now;
        ballotsMapping[ballotID] = Ballot({
            owner: owner,
            miningKey: miningKey,
            affectedKey: affectedKey,
            memo: memo, 
            affectedKeyType: affectedKeyType,
            createdAt: now,
            votingStart: votingStart,
            votingDeadline: votingStart + 48 * 60 minutes,
            votesAmmount: 0,
            result: 0,
            addAction: addAction,
            active: true
        });
        ballots.push(ballotID);
        checkBallotsActivity();
    }
    
    /**
    @notice Gets active ballots' ids
    @return { "value" : "Array of active ballots ids" }
    */
    function getBallots() constant returns (uint[] value) {
        return ballots;
    }
    
    /**
    @notice Gets ballot's memo
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's memo" }
    */
    function getBallotMemo(uint ballotID) constant returns (string value) {
        return ballotsMapping[ballotID].memo;
    }
    
    /**
    @notice Gets ballot's action
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's action: adding is true, removing is false" }
    */
    function getBallotAction(uint ballotID) constant returns (bool value) {
        return ballotsMapping[ballotID].addAction;
    }
    
    /**
    @notice Gets mining key of notary
    @param ballotID Ballot unique ID
    @return { "value" : "Notary's mining key" }
    */
    function getBallotMiningKey(uint ballotID) constant returns (address value) {
        return ballotsMapping[ballotID].miningKey;
    }

    /**
    @notice Gets affected key of ballot
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's affected key" }
    */
    function getBallotAffectedKey(uint ballotID) constant returns (address value) {
        return ballotsMapping[ballotID].affectedKey;
    }

    /**
    @notice Gets affected key type of ballot
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's affected key type" }
    */
    function getBallotAffectedKeyType(uint ballotID) constant returns (uint value) {
        return ballotsMapping[ballotID].affectedKeyType;
    }

    function toString(address x) internal returns (string) {
        bytes memory b = new bytes(20);
        for (uint i = 0; i < 20; i++)
            b[i] = byte(uint8(uint(x) / (2**(8*(19 - i)))));
        return string(b);
    }

    /**
    @notice Gets ballot's owner full name
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's owner full name" }
    */
    function getBallotOwner(uint ballotID) constant returns (string value) {
        address ballotOwnerVotingKey = ballotsMapping[ballotID].owner;
        address ballotOwnerMiningKey = votingMiningKeysPair[ballotOwnerVotingKey];
        string validatorFullName = validator[ballotOwnerMiningKey].fullName;
        bytes memory ownerName = bytes(validatorFullName);
        if (ownerName.length == 0)
            return toString(ballotOwnerMiningKey);
        else
            return validatorFullName;
    }
    
    /**
    @notice Gets ballot's creation time
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's creation time" }
    */
    function ballotCreatedAt(uint ballotID) constant returns (uint value) {
        return ballotsMapping[ballotID].createdAt;
    }
    
    /**
    @notice Gets ballot's voting start date
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's voting start date" }
    */
    function getBallotVotingStart(uint ballotID) constant returns (uint value) {
        return ballotsMapping[ballotID].votingStart;
    }
    
    /**
    @notice Gets ballot's voting end date
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's voting end date" }
    */
    function getBallotVotingEnd(uint ballotID) constant returns (uint value) {
        return ballotsMapping[ballotID].votingDeadline;
    }
    
    /**
    @notice Gets ballot's amount of votes for
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's amount of votes for" }
    */
    function getVotesFor(uint ballotID) constant returns (int value) {
        return (ballotsMapping[ballotID].votesAmmount + ballotsMapping[ballotID].result)/2;
    }
    
    /**
    @notice Gets ballot's amount of votes against
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's amount of votes against" }
    */
    function getVotesAgainst(uint ballotID) constant returns (int value) {
        return (ballotsMapping[ballotID].votesAmmount - ballotsMapping[ballotID].result)/2;
    }
    
    /**
    @notice Checks, if ballot is active
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot's activity: active or not" }
    */
    function ballotIsActive(uint ballotID) constant returns (bool value) {
        return ballotsMapping[ballotID].active;
    }

    /**
    @notice Checks, if ballot is already voted by signer of current transaction
    @param ballotID Ballot unique ID
    @return { "value" : "Ballot is already voted by signer of current transaction: yes or no" }
    */
    function ballotIsVoted(uint ballotID) constant returns (bool value) {
        return ballotsMapping[ballotID].voted[msg.sender];
    }
    
    /**
    @notice Votes
    @param ballotID Ballot unique ID
    @param accept Vote for is true, vote against is false
    */
    function vote(uint ballotID, bool accept) {
        if (!checkVotingKeyValidity(msg.sender)) throw;
        Ballot v =  ballotsMapping[ballotID];
        if (v.votingDeadline < now) throw;
        if (v.voted[msg.sender] == true) throw;
        v.voted[msg.sender] = true;
        v.votesAmmount++;
        if (accept) v.result++;
        else v.result--;
        checkBallotsActivity();
    }

    /**
    @notice Removes element by index from validators array and shift elements in array
    @param index Element's index to remove
    @return { "value" : "Updated validators array with removed element at index" }
    */
    function removeValidator(uint index) internal returns(address[]) {
        if (index >= validators.length) return;

        for (uint i = index; i<validators.length-1; i++){
            validators[i] = validators[i+1];
        }
        delete validators[validators.length-1];
        validators.length--;
    }
    
    /**
    @notice Checks ballots' activity
    @dev Deactivate ballots, if ballot's time is finished and implement action: add or remove notary, if votes for are greater votes against, and total votes are greater than 3
    */
    function checkBallotsActivity() internal {
        for (uint ijk = 0; ijk < ballots.length; ijk++) {
            Ballot b = ballotsMapping[ballots[ijk]];
            if (b.votingDeadline < now && b.active) {
                if ((int(b.votesAmmount) >= int(votingLowerLimit)) && b.result > 0) {
                    if (b.addAction) { //add key
                        if (b.affectedKeyType == 0) {//mining key
                            if (licensesIssued < licensesLimit) {
                                licensesIssued++;
                                validators.push(b.affectedKey);
                            }
                        } else if (b.affectedKeyType == 1) {//voting key
                            votingKeys[b.affectedKey] = VotingKey({isActive: true});
                            votingMiningKeysPair[b.affectedKey] = b.miningKey;
                        } else if (b.affectedKeyType == 2) {//payout key
                            payoutKeys[b.affectedKey] = PayoutKey({isActive: true});
                            miningPayoutKeysPair[b.miningKey] = b.affectedKey;
                        }
                    } else { //invalidate key
                        if (b.affectedKeyType == 0) {//mining key
                            for (uint jj = 0; jj < validators.length; jj++) {
                                if (validators[jj] == b.affectedKey) {
                                    removeValidator(jj); 
                                    return;
                                }
                            }
                            disabledValidators.push(b.affectedKey);
                            validator[b.affectedKey].disablingDate = now;
                        } else if (b.affectedKeyType == 1) {//voting key
                            votingKeys[b.affectedKey] = VotingKey({isActive: false});
                        } else if (b.affectedKeyType == 2) {//payout key
                            payoutKeys[b.affectedKey] = PayoutKey({isActive: false});
                        }
                    }
                }
                b.active = false;
            }
        }
    }
}