// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SpencerPence is ERC20("SpencerPence", "SPNC"), Ownable {
    address public birthdayBoy;
    uint8 private constant INITIAL_SUPPLY = 29;

    constructor() {
        _mint(owner(), INITIAL_SUPPLY * (10**decimals()));
    }

    modifier onlyBirthdayBoy() {
        require(birthdayBoy != address(0), "No birthday boy is set");
        require(msg.sender == birthdayBoy, "Caller is not the birthday boy");
        _;
    }
}
