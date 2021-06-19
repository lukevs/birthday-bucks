// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract BirthdayBucks is Context, IERC20, IERC20Metadata {
    address private _birthdayBud;
    string private _name;
    string private _symbol;
    uint256 private _birthdayUtcSeconds;
    uint256 private _totalSupplySpentByBirthdayBud = 0;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private constant SECONDS_PER_YEAR = 31557600 seconds;

    event BirthdayBudTransferred(address indexed previousBirthdayBud, address indexed newBirthdayBud);

    constructor(
        string memory name_,
        string memory symbol_,
        address birthdayBud_,
        uint256 birthdayUtcSeconds_
    ) {
        require(birthdayBud_ != address(0), "BirthdayBucks: Birthday bud cannot be the zero address");
        _name = name_;
        _symbol = symbol_;
        _birthdayUtcSeconds = birthdayUtcSeconds_;
        _setBirthdayBud(birthdayBud_);
    }

    modifier onlyBirthdayBud() {
        require(_birthdayBud == _msgSender(), "BirthdayBucks: caller is not the owner");
        _;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }

    function birthdayBud() public view returns (address) {
        return _birthdayBud;
    }

    function totalSupply() public view override returns (uint256) {
        return _getBirthdaySupply();
    }

    function balanceOf(address account) public view override returns (uint256) {
        uint256 accountBalance = _balances[account];
        if (_isBirthdayBud(account)) {
            return accountBalance + _getBirthdayBudAccruedSupply();
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
        require(currentAllowance >= amount, "BirthdayBucks: transfer amount exceeds allowance");
        unchecked { _approve(sender, _msgSender(), currentAllowance - amount); }

        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        _approve(_msgSender(), spender, _allowances[_msgSender()][spender] + addedValue);
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        uint256 currentAllowance = _allowances[_msgSender()][spender];
        require(currentAllowance >= subtractedValue, "BirthdayBucks: decreased allowance below zero");
        unchecked { _approve(_msgSender(), spender, currentAllowance - subtractedValue); }

        return true;
    }

    function transferBirthday(address newBirthdayBud) public virtual onlyBirthdayBud {
        require(newBirthdayBud != address(0), "BirthdayBucks: new birthday bud is the zero address");
        _setBirthdayBud(newBirthdayBud);
    }

    function _setBirthdayBud(address newBirthdayBud) private {
        address oldBirthdayBud = _birthdayBud;
        _birthdayBud = newBirthdayBud;

        if (oldBirthdayBud != address(0)) {
            uint256 accruedSupply = _getBirthdayBudAccruedSupply();
            _balances[oldBirthdayBud] = accruedSupply;
            _totalSupplySpentByBirthdayBud += accruedSupply;
        }

        emit BirthdayBudTransferred(oldBirthdayBud, newBirthdayBud);
    }

    function _getBirthdayBudAccruedSupply() private view returns (uint256) {
        return _getBirthdaySupply() - _totalSupplySpentByBirthdayBud;
    }

    function _getBirthdaySupply() private view returns (uint256) {
        return ((_getSpencersAgeSeconds() * (10**decimals())) / SECONDS_PER_YEAR);
    }

    function _getSpencersAgeSeconds() private view returns (uint256) {
        return block.timestamp - _birthdayUtcSeconds;
    }

    function _isBirthdayBud(address account) private view returns (bool) {
        return _birthdayBud == account;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) private {
        require(sender != address(0), "BirthdayBucks: transfer from the zero address");
        require(recipient != address(0), "BirthdayBucks: transfer to the zero address");

        uint256 senderBalance = balanceOf(sender);
        require(senderBalance >= amount, "BirthdayBucks: transfer amount exceeds balance");
        if (_isBirthdayBud(sender)) {
            _reduceBirthdayBudBalance(amount);
        } else {
            _balances[sender] = senderBalance - amount;
        }

        _balances[recipient] += amount;

        emit Transfer(sender, recipient, amount);
    }

    function _reduceBirthdayBudBalance(uint256 amount) private {
        uint256 remainingAmount = amount;
        uint256 accruedSupply = _getBirthdayBudAccruedSupply();

        if (remainingAmount > 0 && accruedSupply > 0) {
            if (remainingAmount >= accruedSupply) {
                _totalSupplySpentByBirthdayBud += accruedSupply;
                remainingAmount -= accruedSupply;
            } else {
                _totalSupplySpentByBirthdayBud += remainingAmount;
                remainingAmount = 0;
            }
        }

        if (remainingAmount > 0) {
            assert(_balances[_birthdayBud] >= remainingAmount);
            _balances[_birthdayBud] -= remainingAmount;
        }
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) internal {
        require(owner != address(0), "BirthdayBucks: approve from the zero address");
        require(spender != address(0), "BirthdayBucks: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}
