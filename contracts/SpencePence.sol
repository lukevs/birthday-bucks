// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SpencePence is ERC20, Ownable {
    address public birthdayBoy;
    uint256 public lastInflationAt;

    uint256 private constant SPENCERS_30TH_BIRTHDAY_UTC = 1622692800 seconds;
    uint256 private constant SECONDS_PER_YEAR = 31557600 seconds;
    uint8 private constant INITIAL_SUPPLY = 30;

    constructor() ERC20("SpencePence", "SPNC") {
        _mint(owner(), _decimalAdjusted(INITIAL_SUPPLY));
        lastInflationAt = SPENCERS_30TH_BIRTHDAY_UTC;
    }

    modifier onlyBirthdayBoy() {
        require(birthdayBoy != address(0), "SpencePence: No birthday boy is set");
        require(msg.sender == birthdayBoy, "SpencePence: Caller is not the birthday boy");
        _;
    }

    function imTheBirthdayBoy() external {
        require(birthdayBoy == address(0), "SpencePence: We already have a birthday boy");

        // will fail without approval from owner
        transferFrom(owner(), msg.sender, balanceOf(owner()));
        birthdayBoy = msg.sender;
    }

    function claimInflation() external onlyBirthdayBoy {
        uint256 secondsSinceLastInflation = block.timestamp - lastInflationAt;
        uint256 amountToMint = secondsSinceLastInflation / SECONDS_PER_YEAR;
        _mint(birthdayBoy, _decimalAdjusted(amountToMint));
        lastInflationAt = block.timestamp;
    }

    function _decimalAdjusted(uint256 amount) internal view returns (uint256) {
        return amount * (10**decimals());
    }
}
