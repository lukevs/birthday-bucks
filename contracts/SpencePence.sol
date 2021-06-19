// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract SpencePence is Context, IERC20, IERC20Metadata {
    address public birthdayBoy;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupplySpentByBirthdayBoy = 0;

    string private constant NAME = "SpencePence";
    string private constant SYMBOL = "SPNC";
    uint256 private constant SPENCERS_BIRTHDAY_UTC = 675921600 seconds;
    uint256 private constant SECONDS_PER_YEAR = 31557600 seconds;

    constructor(address _birthdayBoy) {
        require(_birthdayBoy != address(0), "Birthday boy cannot be the zero address");
        birthdayBoy = _birthdayBoy;
    }

    function name() public pure override returns (string memory) {
        return NAME;
    }

    function symbol() public pure override returns (string memory) {
        return SYMBOL;
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function totalSupply() public view override returns (uint256) {
        return _getBirthdaySupply();
    }

    function balanceOf(address account) public view override returns (uint256) {
        uint256 accountBalance = _balances[account];
        if (_isBirthdayBoy(account)) {
            return accountBalance + _getBirthdayBoyAccruedSupply();
        } else {
            return accountBalance;
        }
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _transfer(sender, recipient, amount);

        uint256 currentAllowance = _allowances[sender][_msgSender()];
        require(currentAllowance >= amount, "SpencePence: transfer amount exceeds allowance");
        unchecked { _approve(sender, _msgSender(), currentAllowance - amount); }

        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(currentAllowance >= subtractedValue, "SpencePence: decreased allowance below zero");
        unchecked { _approve(_msgSender(), spender, currentAllowance - subtractedValue); }

        return true;
    }

    function _getBirthdayBoyAccruedSupply() private view returns (uint256) {
        return _getBirthdaySupply() - _totalSupplySpentByBirthdayBoy;
    }

    function _getBirthdaySupply() private view returns (uint256) {
        return ((_getSpencersAgeSeconds() * (10**decimals())) / SECONDS_PER_YEAR);
    }

    function _getSpencersAgeSeconds() private view returns (uint256) {
        return block.timestamp - SPENCERS_BIRTHDAY_UTC;
    }

    function _isBirthdayBoy(address account) private view returns (bool) {
        return birthdayBoy == account;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) private {
        require(sender != address(0), "SpencePence: transfer from the zero address");
        require(recipient != address(0), "SpencePence: transfer to the zero address");

        uint256 senderBalance = balanceOf(sender);
        require(senderBalance >= amount, "SpencePence: transfer amount exceeds balance");
        if (_isBirthdayBoy(sender)) {
            _reduceBirthdayBoyBalance(amount);
        } else {
            _balances[sender] = senderBalance - amount;
        }

        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    function _reduceBirthdayBoyBalance(uint256 amount) private {
        uint256 remainingAmount = amount;
        uint256 accruedSupply = _getBirthdayBoyAccruedSupply();

        if (remainingAmount > 0 && accruedSupply > 0) {
            if (remainingAmount >= accruedSupply) {
                _totalSupplySpentByBirthdayBoy += accruedSupply;
                remainingAmount -= accruedSupply;
            } else {
                _totalSupplySpentByBirthdayBoy += remainingAmount;
                remainingAmount = 0;
            }
        }

        if (remainingAmount > 0) {
            assert(_balances[birthdayBoy] >= remainingAmount);
            _balances[birthdayBoy] -= remainingAmount;
        }
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal {
        require(owner != address(0), "SpencePence: approve from the zero address");
        require(spender != address(0), "SpencePence: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
