// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./BirthdayBucks.sol";

contract SpencePence is BirthdayBucks {
    uint256 private constant SPENCERS_BIRTHDAY_UTC = 675921600 seconds;

    constructor(address birthdayBoy) BirthdayBucks("SpencePence", "SPNC", birthdayBoy, SPENCERS_BIRTHDAY_UTC) {}
}
