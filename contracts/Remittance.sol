pragma solidity ^0.4.4;

contract Remittance {
    uint public balance;
    bytes32 public bobPwHash;
    bytes32 public carolPwHash;

    function Remittance(bytes32 _bobPwHash, bytes32 _carolPwHash)
        public
        payable {

        balance = msg.value;
        bobPwHash = _bobPwHash;
        carolPwHash = _carolPwHash;
    }

    function withdraw(bytes32 bobPw, bytes32 carolPw)
        public
        returns(bool success) {

        require(balance > 0);
        require(keccak256(bobPw) == bobPwHash);
        require(keccak256(carolPw) == carolPwHash);

        uint amt = balance;
        balance = 0;
        msg.sender.transfer(amt);

        return true;
    }
}
